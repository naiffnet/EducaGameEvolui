import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/database';
import type { InventoryItem, UserInventory } from '../types';
import { ShoppingBag, Coins, Check } from 'lucide-react';

export const InventoryShop: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const [items] = useState<InventoryItem[]>(() => db.getInventoryItems());
  const [inventory, setInventory] = useState<UserInventory>(() => db.getUserInventory(currentUser.id));
  const [activeTab, setActiveTab] = useState<'shop' | 'my_inventory'>('shop');

  const handleBuy = (item: InventoryItem) => {
    if (inventory.ownedItemIds.includes(item.id)) {
      alert('Você já possui este item em seu inventário!');
      return;
    }

    if (inventory.coins < item.cost) {
      alert(`Moedas insuficientes! Você precisa de ${item.cost} Moedas para comprar este item. Continue estudando e acumulando presenças para ganhar moedas!`);
      return;
    }

    const updated: UserInventory = {
      ...inventory,
      coins: inventory.coins - item.cost,
      ownedItemIds: [...inventory.ownedItemIds, item.id],
    };

    db.saveUserInventory(currentUser.id, updated);
    setInventory(updated);
    alert(`🎉 Parabéns! Você adquiriu "${item.name}"!`);
  };

  const handleEquipTitle = (titleText?: string) => {
    const updated = { ...inventory, equippedTitle: titleText };
    db.saveUserInventory(currentUser.id, updated);
    setInventory(updated);
    alert(titleText ? `Título "${titleText}" equipado no seu perfil!` : 'Título desequipado.');
  };

  const handleEquipAvatar = (avatarSymbol?: string) => {
    const updated = { ...inventory, equippedAvatar: avatarSymbol };
    db.saveUserInventory(currentUser.id, updated);
    setInventory(updated);
    alert(avatarSymbol ? `Avatar de perfil atualizado para ${avatarSymbol}!` : 'Avatar desequipado.');
  };

  const ownedItems = items.filter(i => inventory.ownedItemIds.includes(i.id));

  return (
    <div className="card" style={{ padding: 24, textAlign: 'left' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={22} style={{ color: 'var(--accent)' }} /> Loja de Recompensas & Inventário
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Troque moedas de estudo acumuladas em presenças e notas por títulos de honra e avatares exclusivos.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-tertiary)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', fontWeight: 800, color: 'var(--accent)' }}>
            <Coins size={18} /> {inventory.coins} Moedas
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn ${activeTab === 'shop' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => setActiveTab('shop')}
            >
              Loja Escolar ({items.length})
            </button>
            <button
              className={`btn ${activeTab === 'my_inventory' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => setActiveTab('my_inventory')}
            >
              Meu Inventário ({ownedItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* SHOP TAB */}
      {activeTab === 'shop' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {items.map(item => {
            const isOwned = inventory.ownedItemIds.includes(item.id);

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: isOwned ? '2px solid var(--success)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="badge badge-primary" style={{ fontSize: 9 }}>
                      {item.rarity}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Coins size={14} /> {item.cost}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                    {item.value ? `${item.value} ` : ''}{item.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                </div>

                <div>
                  {isOwned ? (
                    <button disabled className="btn btn-secondary" style={{ width: '100%', padding: '6px 10px', fontSize: 12, opacity: 0.7 }}>
                      <Check size={14} /> Já Adquirido
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12 }}
                    >
                      Comprar por {item.cost} Moedas
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MY INVENTORY TAB */}
      {activeTab === 'my_inventory' && (
        <div>
          {ownedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
              Você ainda não comprou nenhum item na Loja Escolar. Acumule moedas para adquirir seus primeiros títulos!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {ownedItems.map(item => {
                const isEquippedTitle = inventory.equippedTitle === item.value;
                const isEquippedAvatar = inventory.equippedAvatar === item.value;
                const isEquipped = isEquippedTitle || isEquippedAvatar;

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: isEquipped ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {item.description}
                      </p>
                    </div>

                    <div>
                      {item.category === 'title' && (
                        <button
                          onClick={() => handleEquipTitle(isEquippedTitle ? undefined : item.value)}
                          className={`btn ${isEquippedTitle ? 'btn-danger' : 'btn-primary'}`}
                          style={{ width: '100%', padding: '6px 10px', fontSize: 12 }}
                        >
                          {isEquippedTitle ? 'Desequipar Título' : 'Equipar Título'}
                        </button>
                      )}
                      {item.category === 'avatar' && (
                        <button
                          onClick={() => handleEquipAvatar(isEquippedAvatar ? undefined : item.value)}
                          className={`btn ${isEquippedAvatar ? 'btn-danger' : 'btn-primary'}`}
                          style={{ width: '100%', padding: '6px 10px', fontSize: 12 }}
                        >
                          {isEquippedAvatar ? 'Desequipar Avatar' : 'Usar como Avatar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

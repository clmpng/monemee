import React, { useState, useEffect } from 'react';
import { Button, Icon } from '../../components/common';
import { promotionService, productsService } from '../../services';

/**
 * Promotion Hub Page - Real promotion data and affiliate link creation
 */
function PromotionHub() {
  const [activeTab, setActiveTab] = useState('promotions');
  const [myPromotions, setMyPromotions] = useState([]);
  const [myNetwork, setMyNetwork] = useState([]);
  const [discoverProducts, setDiscoverProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [promotionsRes, networkRes, productsRes] = await Promise.all([
          promotionService.getMyPromotions(),
          promotionService.getMyNetwork(),
          productsService.discoverProducts()
        ]);
        if (promotionsRes.success) setMyPromotions(promotionsRes.data || []);
        if (networkRes.success) setMyNetwork(networkRes.data || []);
        if (productsRes.success) setDiscoverProducts(productsRes.data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const handleGenerateLink = async (productId) => {
    try {
      setGeneratingLink(productId);
      const response = await promotionService.generateLink(productId);
      if (response.success) {
        await navigator.clipboard.writeText(response.data.link);
        setCopiedLink(productId);
        const res = await promotionService.getMyPromotions();
        if (res.success) setMyPromotions(res.data || []);
        setTimeout(() => setCopiedLink(null), 3000);
      }
    } catch (err) {
      alert('Link konnte nicht erstellt werden');
    } finally {
      setGeneratingLink(null);
    }
  };

  const handleCopyLink = async (code, productId) => {
    const link = `${window.location.origin}/p/${productId}?ref=${code}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(productId);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Promotion</h1></div>
        <div style={{ textAlign: 'center', padding: '48px' }}>Wird geladen...</div>
      </div>
    );
  }

  const totalClicks = myPromotions.reduce((sum, p) => sum + (p.clicks || 0), 0);
  const totalConversions = myPromotions.reduce((sum, p) => sum + (p.conversions || 0), 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Promotion</h1>
        <p className="page-subtitle">Bewerbe Produkte und verdiene Provisionen</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { value: myPromotions.length, label: 'Promotions' },
          { value: totalClicks, label: 'Klicks' },
          { value: `${conversionRate}%`, label: 'Conversion' }
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)',
            padding: '16px', textAlign: 'center', border: '1px solid var(--color-border)'
          }}>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{s.value}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {[
          { id: 'promotions', label: 'Meine Links', icon: 'link' },
          { id: 'network', label: 'Mein Netzwerk', icon: 'users' },
          { id: 'discover', label: 'Entdecken', icon: 'search' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
            borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
            background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
            color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
            border: activeTab === tab.id ? 'none' : '1px solid var(--color-border)'
          }}>
            <Icon name={tab.icon} size="sm" />{tab.label}
          </button>
        ))}
      </div>

      {/* My Promotions */}
      {activeTab === 'promotions' && (
        myPromotions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myPromotions.map(promo => (
              <div key={promo.id} style={{
                display: 'flex', gap: '12px', padding: '16px',
                background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-tertiary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  {promo.productThumbnail ? <img src={promo.productThumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="image" size="md" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{promo.productTitle}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {formatCurrency(promo.productPrice)} • {promo.commission}% Provision
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                    <span><Icon name="mousePointer" size="xs" /> {promo.clicks} Klicks</span>
                    <span style={{ color: 'var(--color-success)' }}><Icon name="check" size="xs" /> {promo.conversions} Sales</span>
                  </div>
                </div>
                <button onClick={() => handleCopyLink(promo.code, promo.productId)} style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-md)', border: 'none',
                  background: copiedLink === promo.productId ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                  color: copiedLink === promo.productId ? 'white' : 'var(--color-text-primary)',
                  cursor: 'pointer', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Icon name={copiedLink === promo.productId ? 'check' : 'copy'} size="sm" />
                  {copiedLink === promo.productId ? 'Kopiert!' : 'Link'}
                </button>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="link" title="Noch keine Promotions" desc="Entdecke Produkte und erstelle Affiliate-Links!" action={() => setActiveTab('discover')} actionLabel="Produkte entdecken" />
      )}

      {/* Network */}
      {activeTab === 'network' && (
        myNetwork.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myNetwork.map(p => (
              <div key={p.id} style={{
                display: 'flex', gap: '12px', padding: '16px', alignItems: 'center',
                background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--color-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600'
                }}>{p.name?.charAt(0) || 'P'}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600' }}>{p.name || `@${p.username}`}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{p.productsPromoted} Produkte beworben</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-success)' }}>{p.conversions}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Conversions</p>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="users" title="Noch kein Netzwerk" desc="Wenn andere deine Produkte bewerben, erscheinen sie hier." />
      )}

      {/* Discover */}
      {activeTab === 'discover' && (
        discoverProducts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {discoverProducts.map(product => {
              const isPromoting = myPromotions.some(p => p.productId === product.id);
              return (
                <div key={product.id} style={{
                  display: 'flex', gap: '12px', padding: '16px',
                  background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-tertiary)', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {product.thumbnail ? <img src={product.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="image" size="lg" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{product.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>von @{product.creatorUsername}</p>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700' }}>{formatCurrency(product.price)}</span>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)',
                        padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600'
                      }}>{product.commission}% Provision</span>
                    </div>
                    <button onClick={() => handleGenerateLink(product.id)} disabled={generatingLink === product.id || isPromoting} style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none',
                      background: isPromoting ? 'var(--color-bg-tertiary)' : 'var(--color-primary)',
                      color: isPromoting ? 'var(--color-text-secondary)' : 'white',
                      cursor: isPromoting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <Icon name={isPromoting ? 'check' : 'link'} size="sm" />
                      {generatingLink === product.id ? 'Erstelle...' : isPromoting ? 'Bereits promotet' : 'Link erstellen'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <EmptyState icon="search" title="Keine Produkte verfügbar" desc="Schau später nochmal vorbei!" />
      )}
    </div>
  );
}

function EmptyState({ icon, title, desc, action, actionLabel }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
      }}><Icon name={icon} size="xl" /></div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: action ? '20px' : 0 }}>{desc}</p>
      {action && <Button variant="primary" onClick={action}>{actionLabel}</Button>}
    </div>
  );
}

export default PromotionHub;
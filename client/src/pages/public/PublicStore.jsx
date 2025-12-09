import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '../../components/common';
import { usersService } from '../../services';

/**
 * Public Store Page - Shows creator's public storefront
 */
function PublicStore() {
  const { username } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const response = await usersService.getPublicStore(username);
        if (response.success) {
          setStore(response.data.store);
          setProducts(response.data.products || []);
        } else {
          setError('Store nicht gefunden');
        }
      } catch (err) {
        setError('Store konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [username]);

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Kostenlos';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p>Store wird geladen...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '20px' }}>
        <Icon name="searchX" size="xl" />
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Store nicht gefunden</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Der Store @{username} existiert nicht.</p>
        <Link to="/" style={{ marginTop: '16px', padding: '12px 24px', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>Zur Startseite</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <header style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '20px', fontWeight: '700' }}>💸 MoneMee</span>
          <Link to="/login" style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '14px' }}>Anmelden</Link>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Profile */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', margin: '0 auto 16px', overflow: 'hidden' }}>
            {store.avatar ? <img src={store.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(store.name)}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{store.name}</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>@{store.username}</p>
          {store.level > 1 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
              <Icon name="star" size="xs" />Level {store.level}
            </div>
          )}
          {store.bio && <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{store.bio}</p>}
        </div>

        {/* Products */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Produkte ({products.length})</h2>
          {products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
              {products.map(product => (
                <Link key={product.id} to={`/p/${product.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '5/3', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.thumbnail ? <img src={product.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="image" size="xl" />}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.title}</p>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)' }}>{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <Icon name="package" size="xl" />
              <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)' }}>Noch keine Produkte</p>
            </div>
          )}
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
        Powered by <a href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>MoneMee</a>
      </footer>
    </div>
  );
}

export default PublicStore;
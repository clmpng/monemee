import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../../components/products';

/**
 * Public Store Page
 * Visible to anyone - shows creator's public storefront
 * URL: /:username
 */
function PublicStore() {
  const { username } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch store data from API
    // Mock data for now
    setTimeout(() => {
      setStore({
        username: username,
        name: 'Max Mustermann',
        bio: 'Digital Creator | Sharing knowledge about productivity and design.',
        avatar: null
      });
      
      setProducts([
        { id: 1, title: 'Ultimate Productivity Guide', price: 29.99, thumbnail: null, status: 'active', views: 234, sales: 12 },
        { id: 2, title: 'Design Templates Bundle', price: 49.99, thumbnail: null, status: 'active', views: 156, sales: 8 }
      ]);
      
      setLoading(false);
    }, 500);
  }, [username]);

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <p>Store wird geladen...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="page" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Store nicht gefunden</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Der Store @{username} existiert nicht.
        </p>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: '20px' }}>
      {/* Store Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: '700',
          color: 'white',
          margin: '0 auto 16px'
        }}>
          {store.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
          {store.name}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          @{store.username}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '280px', margin: '0 auto' }}>
          {store.bio}
        </p>
      </div>

      {/* Products */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '16px' 
      }}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showActions={false}
            onClick={() => console.log('Navigate to product', product.id)}
          />
        ))}
      </div>

      {/* MoneMee Branding */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '48px', 
        paddingTop: '24px',
        borderTop: '1px solid var(--color-border)'
      }}>
        <a 
          href="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            color: 'var(--color-text-tertiary)',
            fontSize: '14px'
          }}
        >
          💸 Powered by MoneMee
        </a>
      </div>
    </div>
  );
}

export default PublicStore;
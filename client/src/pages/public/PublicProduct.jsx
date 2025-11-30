import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/common';

/**
 * Public Product Page
 * Product detail page for buyers
 * URL: /p/:productId?ref=AFFILIATE_CODE
 */
function PublicProduct() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const affiliateCode = searchParams.get('ref');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Save affiliate code to localStorage for later
    if (affiliateCode) {
      localStorage.setItem('monemee_ref', affiliateCode);
      localStorage.setItem('monemee_ref_product', productId);
    }

    // TODO: Fetch product from API
    setTimeout(() => {
      setProduct({
        id: productId,
        title: 'Ultimate Productivity Guide',
        description: 'Der ultimative Guide für mehr Produktivität im Alltag. Mit praktischen Tipps und Übungen, die du sofort umsetzen kannst.\n\n✅ 50+ Seiten Content\n✅ Checklisten & Templates\n✅ Bonus: Video-Tutorials',
        price: 29.99,
        thumbnail: null,
        creator: {
          name: 'Max Mustermann',
          username: 'maxmuster'
        }
      });
      setLoading(false);
    }, 500);
  }, [productId, affiliateCode]);

  const handleBuy = () => {
    // TODO: Redirect to Stripe checkout
    console.log('Buy product', productId, 'with ref:', affiliateCode);
    alert('Checkout wird implementiert...');
  };

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <p>Produkt wird geladen...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Produkt nicht gefunden</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Dieses Produkt existiert nicht oder wurde entfernt.
        </p>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Kostenlos';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="page" style={{ paddingTop: '20px' }}>
      {/* Product Image */}
      <div style={{
        aspectRatio: '16 / 9',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px'
      }}>
        {product.thumbnail ? (
          <img 
            src={product.thumbnail} 
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
          />
        ) : (
          '📦'
        )}
      </div>

      {/* Product Info */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          {product.title}
        </h1>
        
        {/* Creator */}
        <a 
          href={`/${product.creator.username}`}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            color: 'var(--color-text-secondary)',
            marginBottom: '16px'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: '600'
          }}>
            {product.creator.name[0]}
          </div>
          {product.creator.name}
        </a>

        {/* Price */}
        <div style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: 'var(--color-primary)',
          marginBottom: '24px'
        }}>
          {formatPrice(product.price)}
        </div>

        {/* Description */}
        <div style={{ 
          whiteSpace: 'pre-line',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.6'
        }}>
          {product.description}
        </div>
      </div>

      {/* Buy Button - Fixed at bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border)'
      }}>
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <Button fullWidth size="large" onClick={handleBuy}>
            Jetzt kaufen - {formatPrice(product.price)}
          </Button>
        </div>
      </div>

      {/* Spacer for fixed button */}
      <div style={{ height: '80px' }} />
    </div>
  );
}

export default PublicProduct;
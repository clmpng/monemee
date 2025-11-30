import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/components/ProductCard.module.css';

/**
 * Product Card Component - Stan.store inspired design
 */
function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  showActions = true,
  onClick 
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(product);
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Kostenlos';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className={styles.productCard} onClick={handleClick}>
      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        {product.thumbnail ? (
          <img 
            src={product.thumbnail} 
            alt={product.title} 
            className={styles.thumbnailImage}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            📦
          </div>
        )}
        
        {/* Status Badge */}
        <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusActive : styles.statusDraft}`}>
          {product.status === 'active' ? 'Live' : 'Entwurf'}
        </span>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={`${styles.price} ${(!product.price || product.price === 0) ? styles.priceFree : ''}`}>
          {formatPrice(product.price)}
        </p>
        
        {/* Stats */}
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={styles.statIcon}>👁️</span>
            {product.views || 0}
          </span>
          <span className={styles.stat}>
            <span className={styles.statIcon}>💰</span>
            {product.sales || 0}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className={styles.actions}>
          <button 
            className={`${styles.actionButton} ${styles.editButton}`}
            onClick={handleEdit}
          >
            ✏️ Bearbeiten
          </button>
          <button 
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={handleDelete}
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Add Product Card - CTA to create new product
 */
function AddProductCard({ onClick }) {
  return (
    <div className={styles.addProductCard} onClick={onClick}>
      <div className={styles.addIcon}>+</div>
      <span className={styles.addText}>Produkt erstellen</span>
    </div>
  );
}

ProductCard.Add = AddProductCard;

export default ProductCard;
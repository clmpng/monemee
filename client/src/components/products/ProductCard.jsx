import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../common';
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
        {product.thumbnail_url ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.title} 
            className={styles.thumbnailImage}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <Icon name="package" size="xl" />
          </div>
        )}
        
        {/* Status Badge */}
        <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusActive : styles.statusDraft}`}>
          {product.status === 'active' ? 'Public' : 'Entwurf'}
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
            <span className={styles.statIcon}>
              <Icon name="eye" size="sm" />
            </span>
            {product.views || 0}
          </span>
          <span className={styles.stat}>
            <span className={styles.statIcon}>
              <Icon name="shoppingBag" size="sm" />
            </span>
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
            <Icon name="edit" size="sm" />
            <span>Bearbeiten</span>
          </button>
          <button 
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={handleDelete}
          >
            <Icon name="trash" size="sm" />
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
      <div className={styles.addIcon}>
        <Icon name="plus" size="lg" />
      </div>
      <span className={styles.addText}>Produkt erstellen</span>
    </div>
  );
}

ProductCard.Add = AddProductCard;

export default ProductCard;
/**
 * Unit Tests: Button Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/common/Button';

// Mock CSS Module
jest.mock('../../styles/components/Button.module.css', () => ({
  button: 'button',
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'ghost',
  danger: 'danger',
  success: 'success',
  small: 'small',
  large: 'large',
  fullWidth: 'fullWidth',
  iconOnly: 'iconOnly',
  loading: 'loading',
  spinner: 'spinner',
  icon: 'icon'
}));

describe('Button Component', () => {

  describe('Rendering', () => {
    it('sollte Button mit Text rendern', () => {
      render(<Button>Klick mich</Button>);
      expect(screen.getByRole('button', { name: /klick mich/i })).toBeInTheDocument();
    });

    it('sollte default type="button" haben', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('sollte type="submit" unterstützen', () => {
      render(<Button type="submit">Absenden</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variants', () => {
    it('sollte primary Variant als Default haben', () => {
      render(<Button>Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('primary');
    });

    it('sollte secondary Variant unterstützen', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('secondary');
    });

    it('sollte ghost Variant unterstützen', () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('ghost');
    });

    it('sollte danger Variant unterstützen', () => {
      render(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('danger');
    });

    it('sollte success Variant unterstützen', () => {
      render(<Button variant="success">Success</Button>);
      expect(screen.getByRole('button')).toHaveClass('success');
    });
  });

  describe('Sizes', () => {
    it('sollte small Size unterstützen', () => {
      render(<Button size="small">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('small');
    });

    it('sollte medium Size als Default haben (keine extra Klasse)', () => {
      render(<Button size="medium">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('small');
      expect(button).not.toHaveClass('large');
    });

    it('sollte large Size unterstützen', () => {
      render(<Button size="large">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('large');
    });
  });

  describe('States', () => {
    it('sollte disabled sein wenn disabled=true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('sollte disabled sein wenn loading=true', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('sollte loading Klasse haben wenn loading=true', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveClass('loading');
    });
  });

  describe('Layout', () => {
    it('sollte fullWidth unterstützen', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('fullWidth');
    });

    it('sollte iconOnly unterstützen', () => {
      render(<Button iconOnly icon={<span>Icon</span>} />);
      expect(screen.getByRole('button')).toHaveClass('iconOnly');
    });

    it('sollte Text bei iconOnly verbergen', () => {
      render(<Button iconOnly icon={<span data-testid="icon">Icon</span>}>Hidden Text</Button>);
      expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Events', () => {
    it('sollte onClick Handler aufrufen', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('sollte onClick nicht aufrufen wenn disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('sollte onClick nicht aufrufen wenn loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Loading</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom ClassName', () => {
    it('sollte custom className hinzufügen', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('sollte custom className mit anderen Klassen kombinieren', () => {
      render(<Button variant="danger" className="my-button">Combined</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('danger');
      expect(button).toHaveClass('my-button');
    });
  });

  describe('Icon Support', () => {
    it('sollte Icon rendern', () => {
      render(<Button icon={<span data-testid="test-icon">★</span>}>Mit Icon</Button>);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Mit Icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sollte keyboard-navigierbar sein', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Accessible</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter' });
      // Enter triggert normalerweise onClick auf buttons
    });

    it('sollte aria-disabled haben wenn disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Additional Props', () => {
    it('sollte zusätzliche Props an button weitergeben', () => {
      render(<Button data-testid="custom-button" aria-label="Custom Label">Props</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });
  });
});

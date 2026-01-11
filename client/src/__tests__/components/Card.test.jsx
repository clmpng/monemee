/**
 * Unit Tests: Card Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../../components/common/Card';

// Mock CSS Module
jest.mock('../../styles/components/Card.module.css', () => ({
  card: 'card',
  noPadding: 'noPadding',
  smallPadding: 'smallPadding',
  padding: 'padding',
  largePadding: 'largePadding',
  clickable: 'clickable',
  elevated: 'elevated',
  highlight: 'highlight',
  header: 'header',
  headerTitle: 'headerTitle',
  headerSubtitle: 'headerSubtitle',
  body: 'body',
  footer: 'footer',
  statsCard: 'statsCard',
  statsIcon: 'statsIcon',
  statsLabel: 'statsLabel',
  statsValue: 'statsValue',
  statsChange: 'statsChange',
  statsChangePositive: 'statsChangePositive',
  statsChangeNegative: 'statsChangeNegative'
}));

describe('Card Component', () => {

  describe('Basic Rendering', () => {
    it('sollte Card mit Inhalt rendern', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('sollte card Klasse haben', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('card');
    });
  });

  describe('Padding Variants', () => {
    it('sollte medium padding als Default haben', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('padding');
    });

    it('sollte none padding unterstützen', () => {
      render(<Card data-testid="card" padding="none">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('noPadding');
    });

    it('sollte small padding unterstützen', () => {
      render(<Card data-testid="card" padding="small">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('smallPadding');
    });

    it('sollte large padding unterstützen', () => {
      render(<Card data-testid="card" padding="large">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('largePadding');
    });
  });

  describe('Card States', () => {
    it('sollte clickable Klasse haben wenn clickable=true', () => {
      render(<Card data-testid="card" clickable>Clickable</Card>);
      expect(screen.getByTestId('card')).toHaveClass('clickable');
    });

    it('sollte elevated Klasse haben wenn elevated=true', () => {
      render(<Card data-testid="card" elevated>Elevated</Card>);
      expect(screen.getByTestId('card')).toHaveClass('elevated');
    });

    it('sollte highlight Klasse haben wenn highlight=true', () => {
      render(<Card data-testid="card" highlight>Highlighted</Card>);
      expect(screen.getByTestId('card')).toHaveClass('highlight');
    });
  });

  describe('Click Handling', () => {
    it('sollte onClick aufrufen wenn clickable=true', () => {
      const handleClick = jest.fn();
      render(<Card clickable onClick={handleClick} data-testid="card">Click me</Card>);

      fireEvent.click(screen.getByTestId('card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('sollte onClick NICHT aufrufen wenn clickable=false', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick} data-testid="card">Not clickable</Card>);

      fireEvent.click(screen.getByTestId('card'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom ClassName', () => {
    it('sollte custom className akzeptieren', () => {
      render(<Card data-testid="card" className="my-custom-class">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('my-custom-class');
    });
  });
});

describe('Card.Header', () => {
  it('sollte Titel rendern', () => {
    render(<Card.Header title="Mein Titel" />);
    expect(screen.getByRole('heading', { name: /mein titel/i })).toBeInTheDocument();
  });

  it('sollte Untertitel rendern wenn angegeben', () => {
    render(<Card.Header title="Titel" subtitle="Mein Untertitel" />);
    expect(screen.getByText('Mein Untertitel')).toBeInTheDocument();
  });

  it('sollte Action-Element rendern wenn angegeben', () => {
    render(
      <Card.Header
        title="Titel"
        action={<button>Action</button>}
      />
    );
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  it('sollte keinen Untertitel rendern wenn nicht angegeben', () => {
    render(<Card.Header title="Nur Titel" />);
    // headerSubtitle sollte nicht existieren
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });
});

describe('Card.Body', () => {
  it('sollte Inhalt rendern', () => {
    render(<Card.Body>Body Content</Card.Body>);
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('sollte body Klasse haben', () => {
    render(<Card.Body data-testid="body">Content</Card.Body>);
    expect(screen.getByTestId('body')).toHaveClass('body');
  });

  it('sollte custom className akzeptieren', () => {
    render(<Card.Body data-testid="body" className="custom-body">Content</Card.Body>);
    expect(screen.getByTestId('body')).toHaveClass('custom-body');
  });
});

describe('Card.Footer', () => {
  it('sollte Inhalt rendern', () => {
    render(<Card.Footer>Footer Content</Card.Footer>);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('sollte footer Klasse haben', () => {
    render(<Card.Footer data-testid="footer">Content</Card.Footer>);
    expect(screen.getByTestId('footer')).toHaveClass('footer');
  });
});

describe('Card.Stats', () => {
  it('sollte Label und Value rendern', () => {
    render(<Card.Stats label="Umsatz" value="1.234 €" />);
    expect(screen.getByText('Umsatz')).toBeInTheDocument();
    expect(screen.getByText('1.234 €')).toBeInTheDocument();
  });

  it('sollte Change anzeigen wenn angegeben', () => {
    render(<Card.Stats label="Umsatz" value="1.234 €" change="+12%" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('sollte positive Change-Klasse haben', () => {
    render(<Card.Stats label="Test" value="100" change="+10%" changeType="positive" data-testid="stats" />);
    const changeElement = screen.getByText('+10%');
    expect(changeElement).toHaveClass('statsChangePositive');
  });

  it('sollte negative Change-Klasse haben', () => {
    render(<Card.Stats label="Test" value="100" change="-5%" changeType="negative" />);
    const changeElement = screen.getByText('-5%');
    expect(changeElement).toHaveClass('statsChangeNegative');
  });

  it('sollte Icon rendern wenn angegeben', () => {
    render(<Card.Stats label="Test" value="100" icon={<span data-testid="icon">★</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('Card Composition', () => {
  it('sollte alle Sub-Komponenten zusammen funktionieren', () => {
    render(
      <Card>
        <Card.Header title="Produkt" subtitle="Details" />
        <Card.Body>
          <p>Produktbeschreibung hier</p>
        </Card.Body>
        <Card.Footer>
          <button>Kaufen</button>
        </Card.Footer>
      </Card>
    );

    expect(screen.getByRole('heading', { name: /produkt/i })).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Produktbeschreibung hier')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kaufen/i })).toBeInTheDocument();
  });
});

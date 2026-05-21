import { CornerPins } from './Pushpin.jsx';

export default function GroceryList({ items, estimatedTotal, taxRate = 0, taxAmount = 0 }) {
  const saleItems = items.filter(i => i.onSale);
  const regularItems = items.filter(i => !i.onSale);

  return (
    <div className="grocery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start' }}>

      {/* Item list */}
      <div style={{
        background: '#faf5e8',
        border: '1px solid #d4c9b0',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 3px 5px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3), 0 16px 30px rgba(0,0,0,0.2)',
        borderLeft: '40px solid #f0e4d4',
        position: 'relative',
      }}>
        <CornerPins />
        <div style={{
          padding: '20px 26px 18px',
          borderBottom: '2px solid #c4b8a0',
        }}>
          <h2 style={{
            fontFamily: 'Pinyon Script, cursive',
            fontSize: 34,
            fontWeight: 400,
            color: '#3a2a18',
          }}>
            Shopping List
          </h2>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            fontWeight: 700,
            color: '#8a7a66',
            marginTop: 5,
            letterSpacing: '0.03em',
          }}>
            {items.length} items · {items.filter(i => i.onHand).length} on hand · {saleItems.length} deals
          </p>
        </div>

        {saleItems.length > 0 && (
          <div style={{ padding: '16px 26px 0' }}>
            <p style={{
              fontFamily: 'Pinyon Script, cursive',
              fontSize: 22,
              fontWeight: 400,
              color: '#b8860b',
              marginBottom: 6,
            }}>
              ★ Deals
            </p>
            {saleItems.map((item, i) => <ItemRow key={i} item={item} />)}
          </div>
        )}

        <div style={{ padding: saleItems.length > 0 ? '16px 26px' : '16px 26px 0' }}>
          {saleItems.length > 0 && (
            <p style={{
              fontFamily: 'Pinyon Script, cursive',
              fontSize: 22,
              fontWeight: 400,
              color: '#6b5a48',
              marginBottom: 6,
            }}>
              Regular Price
            </p>
          )}
          {regularItems.map((item, i) => <ItemRow key={i} item={item} />)}
        </div>

        <div style={{
          margin: '0 26px 22px',
          padding: '14px 0 0',
          borderTop: '2px solid #c4b8a0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}>
          <span style={{
            fontFamily: 'Pinyon Script, cursive',
            fontSize: 24,
            fontWeight: 400,
            color: '#6b5a48',
          }}>
            Estimated Total
          </span>
          <span style={{
            fontFamily: 'Pinyon Script, cursive',
            fontSize: 34,
            fontWeight: 400,
            color: '#3a2a18',
            letterSpacing: '0.01em',
          }}>
            ${estimatedTotal?.toFixed(2)}
          </span>
        </div>
        {taxRate > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0 26px 4px',
          }}>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 13,
              fontWeight: 600,
              fontStyle: 'italic',
              color: '#9a8a72',
            }}>
              Includes ${taxAmount.toFixed(2)} est. tax ({(taxRate * 100).toFixed(1)}%)
            </span>
          </div>
        )}
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 12,
          fontWeight: 600,
          fontStyle: 'italic',
          color: '#9a8a72',
          marginTop: 10,
          padding: '0 26px 14px',
          lineHeight: 1.4,
        }}>
          *Prices shown are averages for your zip code and may not reflect exact in-store pricing.
        </p>
      </div>

      {/* Side summary — cutting board style */}
      <div style={{
        background: `
          url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='200'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.015 0.2' numOctaves='6' seed='5' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='0.15' intercept='0'/><feFuncG type='linear' slope='0.12' intercept='0'/><feFuncB type='linear' slope='0.08' intercept='0'/><feFuncA type='linear' slope='0.35' intercept='0'/></feComponentTransfer></filter><rect width='800' height='200' filter='url(#w)'/></svg>`)}"),
          repeating-linear-gradient(0deg, rgba(120,80,35,0.12) 0px, transparent 1px, transparent 3px, rgba(100,65,25,0.06) 4px, transparent 5px, transparent 8px),
          repeating-linear-gradient(0deg, transparent 0px, transparent 14px, rgba(80,50,20,0.1) 15px, transparent 16px, transparent 35px, rgba(90,55,22,0.07) 36px, transparent 37px, transparent 60px),
          linear-gradient(90deg, #8a6238 0%, #96703e 8%, #a07848 20%, #946c3a 35%, #a57c4a 50%, #9a7242 65%, #a07848 80%, #8e6838 92%, #8a6238 100%)
        `.trim(),
        position: 'relative',
        border: '3px solid #6b4e2e',
        borderRadius: 8,
        padding: '22px 24px',
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.15), inset 0 -2px 6px rgba(0,0,0,0.22), 0 3px 5px rgba(0,0,0,0.38), 0 8px 16px rgba(0,0,0,0.32), 0 16px 30px rgba(0,0,0,0.2)',
      }}>
        <CornerPins />
        <h3 style={{
          fontFamily: 'Pinyon Script, cursive',
          fontSize: 30,
          fontWeight: 400,
          color: '#faf5e8',
          marginBottom: 3,
          textShadow: '2px 2px 0px rgba(60,35,10,0.8), 4px 4px 6px rgba(0,0,0,0.4)',
        }}>
          Budget Summary
        </h3>
        <p style={{
          fontFamily: 'Amatic SC, cursive', textTransform: 'uppercase',
          fontSize: 18,
          fontWeight: 700,
          color: 'rgba(250,245,232,0.9)',
          marginBottom: 22,
          textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
        }}>
          Estimated weekly spend
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SummaryLine label="Groceries" value={`$${estimatedTotal?.toFixed(2)}`} large />
          <SummaryLine label="On hand" value={items.filter(i => i.onHand).length} />
          <SummaryLine label="To buy" value={items.filter(i => !i.onHand).length} />
          <SummaryLine label="Deals" value={saleItems.filter(i => !i.onHand).length} />
        </div>

        <div style={{
          marginTop: 22,
          padding: '14px 16px',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(250,245,232,0.15)',
          borderRadius: 8,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 14,
          fontWeight: 600,
          color: 'rgba(250,245,232,0.9)',
          lineHeight: 1.7,
          textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
        }}>
          <strong style={{ color: '#eaa221', fontWeight: 700 }}>Tip:</strong>{' '}
          Hit "Change It Up!" button to spice up your recipe variety!
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #3a5a8a',
      gap: 12,
      opacity: item.onHand ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 15,
          fontWeight: 600,
          color: item.onHand ? '#b0a898' : '#3a2a18',
          textDecoration: item.onHand ? 'line-through' : 'none',
        }}>
          {item.name}
        </span>
        {item.onHand && (
          <span style={{
            background: '#1a6b3a',
            color: '#f0e8da',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 4,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.05em',
          }}>
            ON HAND
          </span>
        )}
        {item.onSale && !item.onHand && (
          <span style={{
            background: 'var(--sale)',
            color: '#1a1400',
            fontSize: 12,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 4,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.05em',
          }}>
            ★ DEAL{item.saleStore ? ` @ ${item.saleStore}` : ''}
          </span>
        )}
      </div>
      <span style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontWeight: 700,
        fontSize: 16,
        color: item.onHand ? '#b0a898' : (item.onSale ? '#b8860b' : '#3a2a18'),
        whiteSpace: 'nowrap',
        textDecoration: item.onHand ? 'line-through' : 'none',
      }}>
        ${item.totalCost.toFixed(2)}
      </span>
    </div>
  );
}

function SummaryLine({ label, value, large }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{
        fontFamily: 'Amatic SC, cursive', textTransform: 'uppercase',
        fontSize: 21,
        fontWeight: 700,
        color: 'rgba(250,245,232,0.9)',
        textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: large ? 'Pinyon Script, cursive' : 'JetBrains Mono, monospace',
        fontSize: large ? 30 : 16,
        fontWeight: large ? 400 : 700,
        color: large ? '#eaa221' : '#faf5e8',
        letterSpacing: large ? '0.01em' : '0',
        textShadow: large ? '2px 2px 0px rgba(60,35,10,0.8), 4px 4px 6px rgba(0,0,0,0.4)' : '1px 1px 2px rgba(0,0,0,0.4)',
      }}>
        {value}
      </span>
    </div>
  );
}

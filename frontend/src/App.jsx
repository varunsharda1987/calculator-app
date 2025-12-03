import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_URL}/api/history`, { method: 'DELETE' });
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const inputOperator = (operator) => {
    setExpression(expression + display + operator);
    setWaitingForOperand(true);
  };

  const calculate = async () => {
    const fullExpression = expression + display;
    if (!fullExpression) return;

    try {
      const res = await fetch(`${API_URL}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: fullExpression })
      });

      const data = await res.json();

      if (res.ok) {
        setDisplay(data.result);
        setExpression('');
        setWaitingForOperand(true);
        fetchHistory();
      } else {
        setDisplay('Error');
        setExpression('');
      }
    } catch (err) {
      console.error('Calculation error:', err);
      setDisplay('Error');
      setExpression('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setWaitingForOperand(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container">
      <div className="calculator">
        <div className="display">
          <div className="expression">{expression || '\u00A0'}</div>
          <div className="result">{display}</div>
        </div>
        <div className="buttons">
          <button className="clear" onClick={clear}>C</button>
          <button className="operator" onClick={() => inputOperator('/')}>/</button>
          <button className="operator" onClick={() => inputOperator('*')}>×</button>
          <button className="operator" onClick={() => inputOperator('-')}>-</button>

          <button className="number" onClick={() => inputDigit('7')}>7</button>
          <button className="number" onClick={() => inputDigit('8')}>8</button>
          <button className="number" onClick={() => inputDigit('9')}>9</button>
          <button className="operator" onClick={() => inputOperator('+')}>+</button>

          <button className="number" onClick={() => inputDigit('4')}>4</button>
          <button className="number" onClick={() => inputDigit('5')}>5</button>
          <button className="number" onClick={() => inputDigit('6')}>6</button>
          <button className="number" onClick={() => inputDigit('0')}>0</button>

          <button className="number" onClick={() => inputDigit('1')}>1</button>
          <button className="number" onClick={() => inputDigit('2')}>2</button>
          <button className="number" onClick={() => inputDigit('3')}>3</button>
          <button className="number" onClick={inputDecimal}>.</button>

          <button className="equals" onClick={calculate}>=</button>
        </div>
      </div>

      <div className="history">
        <h2>
          History
          <button className="clear" onClick={clearHistory}>Clear</button>
        </h2>
        {history.length === 0 ? (
          <div className="empty-history">No calculations yet</div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="expr">{item.expression}</div>
              <div className="res">= {item.result}</div>
              <div className="time">{formatDate(item.created_at)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the weather search experience', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /weather that/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /search weather/i })).toBeInTheDocument();
});

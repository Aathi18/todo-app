import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the Todo Application header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Todo Application/i);
  expect(headerElement).toBeInTheDocument();
});

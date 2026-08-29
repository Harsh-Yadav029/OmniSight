import React from 'react';
import { CartItem } from './CartItem';

export const CartList = ({ items }) => {
  return (
    <div className="space-y-3" id="cart-list">
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
};

import React from 'react';
import { useSession } from 'next-auth/react';
import { MenuItem } from '../types/menu';
import Image from 'next/image';

interface MenuListProps {
  items: MenuItem[];
  onAddToOrder: (item: MenuItem) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
}

const MenuList: React.FC<MenuListProps> = ({ items, onAddToOrder, onEdit, onDelete }) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {item.image && (
            <div className="h-48 w-full overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="mt-1 text-gray-600">{item.description}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {item.available && (
                <button
                  onClick={() => onAddToOrder(item)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Добавить в корзину
                </button>
              )}
              
              {!item.available && (
                <span className="text-red-500">Нет в наличии</span>
              )}
              
              {isAdmin && (
                <>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Редактировать
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Удалить
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuList; 
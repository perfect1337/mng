import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MenuItem from '../components/MenuItem';
import dbConnect from '../lib/mongodb';
import MenuItemModel from '../models/MenuItem';

export async function getServerSideProps() {
  await dbConnect();
  const items = await MenuItemModel.find({}).lean();
  
  return {
    props: {
      initialItems: JSON.parse(JSON.stringify(items))
    }
  };
}

export default function Menu({ initialItems }) {
  const { data: session } = useSession();
  const [menuItems, setMenuItems] = useState(initialItems);
  const [error, setError] = useState('');

  const handleDelete = (deletedId: string) => {
    // Обновляем список после успешного удаления
    setMenuItems(menuItems.filter(item => item._id !== deletedId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Меню</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <MenuItem
            key={item._id}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            available={item.available}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
} 
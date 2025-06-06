import { useState, useEffect } from 'react';

const ProfileModal = ({ isOpen, onClose, userData }) => {
  const [role, setRole] = useState(userData?.role || 'Atleta Amateur');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userData) {
      setRole(userData.role || 'Atleta Amateur');
    }
  }, [userData]);

  if (!isOpen) return null;

  const roles = [
    'Atleta Amateur',
    'Atleta Profesional',
    'Usuari Actiu',
    'Principiant',
    'Entrenador',
    'Altres'
  ];

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    setIsEditing(false);
    // onClose(); // Opcional: cerrar el modal después de guardar
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Perfil d'Usuari</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-user text-2xl text-blue-500"></i>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{userData?.name || 'Usuari'}</h3>
              <p className="text-gray-600">{userData?.age} anys</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alçada</label>
              <div className="p-2 bg-gray-50 rounded">
                {userData?.height || '--'} cm
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pes</label>
              <div className="p-2 bg-gray-50 rounded">
                {userData?.weight || '--'} kg
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMC</label>
              <div className="p-2 bg-gray-50 rounded">
                {userData?.bmi || '--'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              {isEditing ? (
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ) : (
                <div 
                  className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setIsEditing(true)}
                >
                  {role} <i className="fas fa-pencil-alt ml-2 text-xs text-gray-500"></i>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setRole(userData?.role || 'Atleta Amateur');
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Guardar canvis
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Tancar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

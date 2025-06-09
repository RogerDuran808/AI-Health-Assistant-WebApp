import { useState, useEffect } from 'react';
import './ProfileModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTimes, faCalendarAlt, faClock, faDumbbell, faPersonRunning, faBullseye, faStar, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';

const mainGoalOptions = [
  { value: 'maintenance', label: 'Manteniment general' },
  { value: 'fat_loss', label: 'Pèrdua de greix' },
  { value: 'muscle_gain', label: 'Guanyar múscul (hipertròfia)' },
  { value: 'strength_gain', label: 'Guanyar força' },
  { value: 'performance', label: 'Millora del rendiment esportiu específic' },
  { value: 'flexibility', label: 'Millora de la flexibilitat i mobilitat' },
  { value: 'rehab', label: 'Rehabilitació o readaptació funcional' },
];

const experienceLevelOptions = [
  { value: 'beginner', label: 'Principiant' },
  { value: 'intermediate', label: 'Intermedi' },
  { value: 'advanced', label: 'Avançat' },
];

const trainingDaysOptions = Array.from({ length: 7 }, (_, i) => ({ value: i + 1, label: `${i + 1} dia${i > 0 ? 's' : ''}` }));

const trainingMinutesOptions = [
  { value: 15, label: '15 minuts' }, { value: 30, label: '30 minuts' }, { value: 45, label: '45 minuts' },
  { value: 60, label: '1 hora' }, { value: 75, label: '1h 15min' }, { value: 90, label: '1h 30min' },
  { value: 105, label: '1h 45min' }, { value: 120, label: '2 hores' },
];

const equipmentOptions = [
  { id: 'bodyweight', label: 'Pes corporal / sense material' },
  { id: 'elastic_bands', label: 'Bandes elàstiques' },
  { id: 'dumbbells_kettlebells', label: 'Mancuernes / kettlebells' },
  { id: 'full_gym', label: 'Gimnàs complet' },
  { id: 'cardio_machines', label: 'Bicicleta estàtica / cinta / màquina de cardio' },
  { id: 'pool', label: 'Piscina' },
];

const activityPreferenceOptions = [
  { id: 'walking', label: 'Caminar' }, { id: 'running', label: 'Córrer' },
  { id: 'cycling', label: 'Ciclisme' }, { id: 'swimming', label: 'Natació' },
  { id: 'weights_strength', label: 'Peses / força' }, { id: 'hiit', label: 'Entrenaments HIIT' },
  { id: 'mobility_stretching', label: 'Mobilitat i estiraments' }, { id: 'yoga_pilates', label: 'Ioga / pilates' },
];

const daysOfWeek = ['dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte', 'diumenge'];

// Helper to generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};
const timeOptions = generateTimeOptions();

const initialTrainingSchedule = daysOfWeek.reduce((acc, day) => {
  acc[day] = { enabled: false, from: timeOptions[32], to: timeOptions[36] }; // Default 08:00 to 09:00
  return acc;
}, {});

const ProfileModal = ({ isOpen, onClose, userData }) => {
  // Basic Info (from userData, non-editable in this modal usually)
  const name = userData?.name || 'Usuari';
  const age = userData?.age;
  const height = userData?.height;
  const weight = userData?.weight;
  const bmi = userData?.bmi;

  // Profile States
  const [mainGoal, setMainGoal] = useState(mainGoalOptions[0].value);
  const [experienceLevel, setExperienceLevel] = useState(experienceLevelOptions[0].value);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(trainingDaysOptions[2].value); // Default 3 days
  const [trainingMinutesPerSession, setTrainingMinutesPerSession] = useState(trainingMinutesOptions[3].value); // Default 1 hour
  
  const [availableEquipment, setAvailableEquipment] = useState(
    equipmentOptions.reduce((acc, curr) => ({ ...acc, [curr.id]: false }), {})
  );
  const [activityPreferences, setActivityPreferences] = useState(
    activityPreferenceOptions.reduce((acc, curr) => ({ ...acc, [curr.id]: false }), {})
  );
  const [trainingSchedule, setTrainingSchedule] = useState(initialTrainingSchedule);

  // Effect to update profile states if userData changes and contains these fields
  useEffect(() => {
    if (userData) {
      setMainGoal(userData.mainGoal || mainGoalOptions[0].value);
      setExperienceLevel(userData.experienceLevel || experienceLevelOptions[0].value);
      setTrainingDaysPerWeek(userData.trainingDaysPerWeek || trainingDaysOptions[2].value);
      setTrainingMinutesPerSession(userData.trainingMinutesPerSession || trainingMinutesOptions[3].value);
      setAvailableEquipment(prev => equipmentOptions.reduce((acc, curr) => ({ ...acc, [curr.id]: userData.availableEquipment?.[curr.id] || false }), {}));
      setActivityPreferences(prev => activityPreferenceOptions.reduce((acc, curr) => ({ ...acc, [curr.id]: userData.activityPreferences?.[curr.id] || false }), {}));
      setTrainingSchedule(userData.trainingSchedule || initialTrainingSchedule);
    }
  }, [userData]);

  if (!isOpen) return null;

  const handleCheckboxChange = (setter, field) => (e) => {
    setter(prev => ({ ...prev, [field]: e.target.checked }));
  };

  const handleScheduleChange = (day, field, value) => {
    setTrainingSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = () => {
    const profileData = {
      mainGoal,
      experienceLevel,
      trainingDaysPerWeek,
      trainingMinutesPerSession,
      availableEquipment,
      activityPreferences,
      trainingSchedule
    };
    console.log('Saving Profile Data:', profileData);
    // Logic to save data will go here
    onClose(); // Close modal after save
  };

  const renderCheckboxGroup = (options, state, handler, groupName) => (
    <div className="form-group checkbox-group">
      {options.map(option => (
        <label key={option.id} className="checkbox-label">
          <input 
            type="checkbox" 
            checked={state[option.id]} 
            onChange={handler(groupName === 'equipment' ? setAvailableEquipment : setActivityPreferences, option.id)} 
          />
          <FontAwesomeIcon icon={state[option.id] ? faCheckSquare : faSquare} className="checkbox-icon" />
          {option.label.replace('✅ ', '')}
        </label>
      ))}
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Perfil d'Entrenament</h2>
          <button onClick={onClose} className="close-button" aria-label="Tancar">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="profile-section">
            <div className="avatar">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="user-info">
              <h3>{name}</h3>
              <p>{age ? `${age} anys` : 'Edat no especificada'}</p>
            </div>
          </div>

          <div className="basic-stats-display">
            {height && <div className="stat-item-inline"><span className="stat-label-inline">Alçada:</span> <span className="stat-value-inline">{height} cm</span></div>}
            {weight && <div className="stat-item-inline"><span className="stat-label-inline">Pes:</span> <span className="stat-value-inline">{weight} kg</span></div>}
            {bmi && <div className="stat-item-inline"><span className="stat-label-inline">IMC:</span> <span className="stat-value-inline">{bmi}</span></div>}
          </div>

          <div className="form-section">
            <h4 className="form-section-title"><FontAwesomeIcon icon={faBullseye} /> Objectiu Principal</h4>
            <div className="form-group">
              <select className="form-select" value={mainGoal} onChange={(e) => setMainGoal(e.target.value)}>
                {mainGoalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title"><FontAwesomeIcon icon={faStar} /> Nivell d'Experiència</h4>
            <div className="form-group">
              <select className="form-select" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                {experienceLevelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title"><FontAwesomeIcon icon={faCalendarAlt} /> Disponibilitat d'Entrenament</h4>
            <div className="form-group-inline">
              <div className="form-group">
                <label className="form-label">Dies per setmana:</label>
                <select className="form-select" value={trainingDaysPerWeek} onChange={(e) => setTrainingDaysPerWeek(Number(e.target.value))}>
                  {trainingDaysOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Minuts per sessió:</label>
                <select className="form-select" value={trainingMinutesPerSession} onChange={(e) => setTrainingMinutesPerSession(Number(e.target.value))}>
                  {trainingMinutesOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title"><FontAwesomeIcon icon={faDumbbell} /> Equipament Disponible</h4>
            {renderCheckboxGroup(equipmentOptions, availableEquipment, handleCheckboxChange, 'equipment')}
          </div>

          <div className="form-section">
            <h4 className="form-section-title"><FontAwesomeIcon icon={faPersonRunning} /> Preferències d'Activitat Física</h4>
            {renderCheckboxGroup(activityPreferenceOptions, activityPreferences, handleCheckboxChange, 'preferences')}
          </div>

          <div className="form-section">
            <h4 className="form-section-title"><FontAwesomeIcon icon={faClock} /> Disponibilitat d'Entrenament Horària</h4>
            <div className="schedule-grid">
              {daysOfWeek.map(day => (
                <div key={day} className={`schedule-day-row ${trainingSchedule[day].enabled ? 'day-enabled' : ''}`}>
                  <label className="checkbox-label schedule-day-toggle">
                    <input 
                      type="checkbox" 
                      checked={trainingSchedule[day].enabled} 
                      onChange={(e) => handleScheduleChange(day, 'enabled', e.target.checked)}
                    />
                    <FontAwesomeIcon icon={trainingSchedule[day].enabled ? faCheckSquare : faSquare} className="checkbox-icon" />
                    <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                  </label>
                  {trainingSchedule[day].enabled && (
                    <div className="time-inputs">
                      <select 
                        className="form-select time-input"
                        value={trainingSchedule[day].from}
                        onChange={(e) => handleScheduleChange(day, 'from', e.target.value)}
                      >
                        {timeOptions.map(time => <option key={`from-${day}-${time}`} value={time}>{time}</option>)}
                      </select>
                      <span> - </span>
                      <select 
                        className="form-select time-input"
                        value={trainingSchedule[day].to}
                        onChange={(e) => handleScheduleChange(day, 'to', e.target.value)}
                      >
                        {timeOptions.map(time => <option key={`to-${day}-${time}`} value={time}>{time}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="button-group">
            <button onClick={onClose} className="button button-secondary">Tancar</button>
            <button onClick={handleSave} className="button button-primary">Guardar Canvis</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

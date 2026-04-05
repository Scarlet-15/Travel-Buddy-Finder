export const LOCATION_OPTIONS = [
  // Campus
  { value: 'NIT Trichy Main Gate', label: 'NIT Trichy Main Gate' },
  { value: 'NIT Trichy Hostel Zone', label: 'NIT Trichy Hostel Zone' },

  // Trichy
  { value: 'Trichy Junction (Railway)', label: 'Trichy Junction (Railway)' },
  { value: 'Trichy Central Bus Stand', label: 'Trichy Central Bus Stand' },
  { value: 'Trichy Airport', label: 'Trichy Airport' },
  { value: 'Srirangam', label: 'Srirangam' },
  { value: 'Chatram Bus Stand', label: 'Chatram Bus Stand' },

  // Major cities
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Chennai Airport', label: 'Chennai Airport' },
  { value: 'Chennai Central (Railway)', label: 'Chennai Central (Railway)' },
  { value: 'Chennai Mofussil Bus Terminus (CMBT)', label: 'Chennai Mofussil Bus Terminus (CMBT)' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Kempegowda Bus Station (Bangalore)', label: 'Kempegowda Bus Station (Bangalore)' },
  { value: 'Bangalore Airport', label: 'Bangalore Airport' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Pune', label: 'Pune' },
];

export const DESTINATION_OPTIONS = LOCATION_OPTIONS.filter(
  l => !l.value.startsWith('NIT Trichy')
);

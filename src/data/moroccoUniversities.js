// Comprehensive list of Moroccan universities and higher education institutions
export const moroccoUniversities = [
  // Public Universities - Casablanca-Settat Region
  { name: 'Université Hassan II de Casablanca', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'Université Hassan 1er de Settat', type: 'public', city: 'Settat', region: 'Casablanca-Settat' },

  // Public Universities - Rabat-Salé-Kénitra Region
  { name: 'Université Mohammed V de Rabat', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'Université Internationale de Rabat (UIR)', type: 'private', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'Université Ibn Tofail de Kénitra', type: 'public', city: 'Kénitra', region: 'Rabat-Salé-Kénitra' },

  // Public Universities - Fès-Meknès Region
  { name: 'Université Sidi Mohamed Ben Abdellah de Fès', type: 'public', city: 'Fès', region: 'Fès-Meknès' },
  { name: 'Université Moulay Ismaïl de Meknès', type: 'public', city: 'Meknès', region: 'Fès-Meknès' },
  { name: 'Université Euromed de Fès (UEMF)', type: 'private', city: 'Fès', region: 'Fès-Meknès' },

  // Public Universities - Marrakech-Safi Region
  { name: 'Université Cadi Ayyad de Marrakech', type: 'public', city: 'Marrakech', region: 'Marrakech-Safi' },
  { name: 'Université Privée de Marrakech (UPM)', type: 'private', city: 'Marrakech', region: 'Marrakech-Safi' },

  // Public Universities - Tanger-Tétouan-Al Hoceïma Region
  { name: 'Université Abdelmalek Essaâdi de Tanger', type: 'public', city: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'Université Abdelmalek Essaâdi de Tétouan', type: 'public', city: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma' },

  // Public Universities - Oriental Region
  { name: 'Université Mohammed Premier d\'Oujda', type: 'public', city: 'Oujda', region: 'Oriental' },
  { name: 'École Nationale des Sciences Appliquées d\'Oujda', type: 'public', city: 'Oujda', region: 'Oriental' },

  // Public Universities - Béni Mellal-Khénifra Region
  { name: 'Université Sultan Moulay Slimane de Béni Mellal', type: 'public', city: 'Béni Mellal', region: 'Béni Mellal-Khénifra' },

  // Public Universities - Souss-Massa Region
  { name: 'Université Ibn Zohr d\'Agadir', type: 'public', city: 'Agadir', region: 'Souss-Massa' },

  // Public Universities - Drâa-Tafilalet Region
  { name: 'Université Moulay Ismaïl d\'Errachidia', type: 'public', city: 'Errachidia', region: 'Drâa-Tafilalet' },

  // Public Universities - Laâyoune-Sakia El Hamra Region
  { name: 'Université Ibn Zohr de Laâyoune', type: 'public', city: 'Laâyoune', region: 'Laâyoune-Sakia El Hamra' },

  // Public Universities - Dakhla-Oued Ed-Dahab Region
  { name: 'Université Ibn Zohr de Dakhla', type: 'public', city: 'Dakhla', region: 'Dakhla-Oued Ed-Dahab' },

  // Private Universities
  { name: 'Al Akhawayn University (AUI)', type: 'private', city: 'Ifrane', region: 'Fès-Meknès' },
  { name: 'Université Mundiapolis de Casablanca', type: 'private', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'ESCA École de Management', type: 'private', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'HEM - Hautes Études de Management', type: 'private', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'EMSI - École Marocaine des Sciences de l\'Ingénieur', type: 'private', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'SUPMTI - Institut Supérieur des Métiers des TIC', type: 'private', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'Université Privée de Fès (UPF)', type: 'private', city: 'Fès', region: 'Fès-Meknès' },

  // Engineering Schools (Grandes Écoles)
  { name: 'École Mohammadia d\'Ingénieurs (EMI)', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'Institut National des Postes et Télécommunications (INPT)', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'École Nationale Supérieure d\'Informatique et d\'Analyse des Systèmes (ENSIAS)', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'École Hassania des Travaux Publics (EHTP)', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'École Nationale Supérieure des Mines de Rabat (ENSMR)', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'École Nationale Supérieure d\'Électricité et de Mécanique (ENSEM)', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'École Nationale de Commerce et de Gestion de Casablanca (ENCG)', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'École Nationale de Commerce et de Gestion d\'Agadir (ENCG)', type: 'public', city: 'Agadir', region: 'Souss-Massa' },
  { name: 'École Nationale de Commerce et de Gestion de Tanger (ENCG)', type: 'public', city: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'École Nationale de Commerce et de Gestion de Marrakech (ENCG)', type: 'public', city: 'Marrakech', region: 'Marrakech-Safi' },
  { name: 'École Nationale des Sciences Appliquées de Casablanca (ENSAC)', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'École Nationale des Sciences Appliquées de Rabat (ENSAR)', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'École Nationale des Sciences Appliquées de Tanger (ENSAT)', type: 'public', city: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'École Nationale des Sciences Appliquées de Marrakech (ENSAM)', type: 'public', city: 'Marrakech', region: 'Marrakech-Safi' },
  { name: 'École Nationale des Sciences Appliquées d\'Agadir (ENSAA)', type: 'public', city: 'Agadir', region: 'Souss-Massa' },
  { name: 'École Nationale des Sciences Appliquées de Fès (ENSAF)', type: 'public', city: 'Fès', region: 'Fès-Meknès' },
  { name: 'École Nationale des Sciences Appliquées de Kénitra (ENSAK)', type: 'public', city: 'Kénitra', region: 'Rabat-Salé-Kénitra' },
  { name: 'École Nationale des Sciences Appliquées de Safi (ENSAS)', type: 'public', city: 'Safi', region: 'Marrakech-Safi' },
  { name: 'École Nationale des Sciences Appliquées de Tétouan (ENSATE)', type: 'public', city: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'École Nationale des Sciences Appliquées d\'El Jadida (ENSAJ)', type: 'public', city: 'El Jadida', region: 'Casablanca-Settat' },
  { name: 'École Nationale des Sciences Appliquées d\'Al Hoceïma (ENSAH)', type: 'public', city: 'Al Hoceïma', region: 'Tanger-Tétouan-Al Hoceïma' },

  // Business Schools
  { name: 'Institut Supérieur de Commerce et d\'Administration des Entreprises (ISCAE)', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'École Supérieure de Technologie de Casablanca (EST)', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'École Supérieure de Technologie de Salé (EST)', type: 'public', city: 'Salé', region: 'Rabat-Salé-Kénitra' },
  { name: 'École Supérieure de Technologie d\'Essaouira (EST)', type: 'public', city: 'Essaouira', region: 'Marrakech-Safi' },
  { name: 'École Supérieure de Technologie de Meknès (EST)', type: 'public', city: 'Meknès', region: 'Fès-Meknès' },
  { name: 'École Supérieure de Technologie d\'Agadir (EST)', type: 'public', city: 'Agadir', region: 'Souss-Massa' },

  // Medical Schools (Facultés de Médecine)
  { name: 'Faculté de Médecine et de Pharmacie de Casablanca', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'Faculté de Médecine et de Pharmacie de Rabat', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'Faculté de Médecine et de Pharmacie de Fès', type: 'public', city: 'Fès', region: 'Fès-Meknès' },
  { name: 'Faculté de Médecine et de Pharmacie de Marrakech', type: 'public', city: 'Marrakech', region: 'Marrakech-Safi' },
  { name: 'Faculté de Médecine et de Pharmacie de Tanger', type: 'public', city: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'Faculté de Médecine et de Pharmacie d\'Oujda', type: 'public', city: 'Oujda', region: 'Oriental' },

  // Dental Schools
  { name: 'Faculté de Médecine Dentaire de Casablanca', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'Faculté de Médecine Dentaire de Rabat', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },

  // Law Schools (Facultés de Droit)
  { name: 'Faculté des Sciences Juridiques Économiques et Sociales de Casablanca', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'Faculté des Sciences Juridiques Économiques et Sociales de Rabat-Agdal', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'Faculté des Sciences Juridiques Économiques et Sociales de Fès', type: 'public', city: 'Fès', region: 'Fès-Meknès' },
  { name: 'Faculté des Sciences Juridiques Économiques et Sociales de Marrakech', type: 'public', city: 'Marrakech', region: 'Marrakech-Safi' },

  // Science Faculties
  { name: 'Faculté des Sciences de Rabat', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'Faculté des Sciences de Casablanca', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'Faculté des Sciences de Fès', type: 'public', city: 'Fès', region: 'Fès-Meknès' },
  { name: 'Faculté des Sciences de Marrakech', type: 'public', city: 'Marrakech', region: 'Marrakech-Safi' },
  { name: 'Faculté des Sciences de Tétouan', type: 'public', city: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma' },
  { name: 'Faculté des Sciences d\'Agadir', type: 'public', city: 'Agadir', region: 'Souss-Massa' },
  { name: 'Faculté des Sciences de Kénitra', type: 'public', city: 'Kénitra', region: 'Rabat-Salé-Kénitra' },
  { name: 'Faculté des Sciences d\'Oujda', type: 'public', city: 'Oujda', region: 'Oriental' },

  // Additional Specialized Institutions
  { name: 'Institut Agronomique et Vétérinaire Hassan II', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'École Nationale d\'Agriculture de Meknès (ENA)', type: 'public', city: 'Meknès', region: 'Fès-Meknès' },
  { name: 'École Nationale Forestière d\'Ingénieurs (ENFI)', type: 'public', city: 'Salé', region: 'Rabat-Salé-Kénitra' },
  { name: 'Institut National de Statistique et d\'Économie Appliquée (INSEA)', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { name: 'École Supérieure des Beaux-Arts de Casablanca', type: 'public', city: 'Casablanca', region: 'Casablanca-Settat' },
  { name: 'Conservatoire National de Musique et de Danse de Rabat', type: 'public', city: 'Rabat', region: 'Rabat-Salé-Kénitra' },
];

// Helper function to remove accents from text
const removeAccents = (str) => {
  return str
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase();
};

// Helper function to search universities
export const searchUniversities = (query) => {
  if (!query || query.length < 2) return [];

  const normalizedQuery = removeAccents(query);
  return moroccoUniversities
    .filter(university => {
      const normalizedName = removeAccents(university.name);
      const normalizedCity = removeAccents(university.city);
      const normalizedType = removeAccents(university.type);
      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedCity.includes(normalizedQuery) ||
        normalizedType.includes(normalizedQuery)
      );
    })
    .slice(0, 10); // Limit to 10 results
};

// Helper function to get university display text
export const getUniversityDisplay = (university) => {
  const typeLabel = university.type === 'public' ? 'Public' : 'Privé';
  return `${university.name} (${typeLabel} - ${university.city})`;
};

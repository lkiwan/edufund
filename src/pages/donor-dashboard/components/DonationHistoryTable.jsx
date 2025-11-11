import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DonationHistoryTable = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const donationHistory = [
    {
      id: 1,
      campaignId: 'camp_001',
      campaignTitle: {
        en: 'Engineering Studies at ENSAM Casablanca',
        fr: 'Études d\'Ingénierie à l\'ENSAM Casablanca',
        ar: 'دراسات الهندسة في المدرسة الوطنية العليا للفنون والمهن الدار البيضاء'
      },
      studentName: 'Youssef ethakafy',
      amount: 2500,
      currency: 'MAD',
      date: new Date('2024-10-15'),
      status: {
        en: 'Active',
        fr: 'Actif',
        ar: 'نشط'
      },
      statusType: 'active',
      progress: 75,
      isAnonymous: false
    },
    {
      id: 2,
      campaignId: 'camp_002',
      campaignTitle: {
        en: 'Medical School Tuition - University of Rabat',
        fr: 'Frais de Scolarité École de Médecine - Université de Rabat',
        ar: 'رسوم كلية الطب - جامعة الرباط'
      },
      studentName: 'Fatima Zahra Alami',
      amount: 5000,
      currency: 'MAD',
      date: new Date('2024-10-10'),
      status: {
        en: 'Funded',
        fr: 'Financé',
        ar: 'ممول'
      },
      statusType: 'funded',
      progress: 100,
      isAnonymous: true
    },
    {
      id: 3,
      campaignId: 'camp_003',
      campaignTitle: {
        en: 'Computer Science Degree - INPT Rabat',
        fr: 'Diplôme en Informatique - INPT Rabat',
        ar: 'شهادة علوم الحاسوب - المعهد الوطني للبريد والاتصالات الرباط'
      },
      studentName: 'Ahmed Tazi',
      amount: 1500,
      currency: 'MAD',
      date: new Date('2024-10-05'),
      status: {
        en: 'Active',
        fr: 'Actif',
        ar: 'نشط'
      },
      statusType: 'active',
      progress: 45,
      isAnonymous: false
    },
    {
      id: 4,
      campaignId: 'camp_004',
      campaignTitle: {
        en: 'Business Administration - ISCAE Casablanca',
        fr: 'Administration des Affaires - ISCAE Casablanca',
        ar: 'إدارة الأعمال - المعهد العليا للتجارة وإدارة المقاولات الدار البيضاء'
      },
      studentName: 'Salma Idrissi',
      amount: 3000,
      currency: 'MAD',
      date: new Date('2024-09-28'),
      status: {
        en: 'Closed',
        fr: 'Fermé',
        ar: 'مغلق'
      },
      statusType: 'closed',
      progress: 30,
      isAnonymous: false
    },
    {
      id: 5,
      campaignId: 'camp_005',
      campaignTitle: {
        en: 'Architecture Studies - ENA Tetouan',
        fr: 'Études d\'Architecture - ENA Tétouan',
        ar: 'دراسات الهندسة المعمارية - المدرسة الوطنية للهندسة المعمارية تطوان'
      },
      studentName: 'Omar arhoune',
      amount: 2000,
      currency: 'MAD',
      date: new Date('2024-09-20'),
      status: {
        en: 'Active',
        fr: 'Actif',
        ar: 'نشط'
      },
      statusType: 'active',
      progress: 60,
      isAnonymous: true
    }
  ];

  const statusOptions = [
    { 
      value: 'all', 
      label: {
        en: 'All Status',
        fr: 'Tous les Statuts',
        ar: 'جميع الحالات'
      }
    },
    { 
      value: 'active', 
      label: {
        en: 'Active',
        fr: 'Actif',
        ar: 'نشط'
      }
    },
    { 
      value: 'funded', 
      label: {
        en: 'Funded',
        fr: 'Financé',
        ar: 'ممول'
      }
    },
    { 
      value: 'closed', 
      label: {
        en: 'Closed',
        fr: 'Fermé',
        ar: 'مغلق'
      }
    }
  ];

  const sortOptions = [
    { 
      value: 'date', 
      label: {
        en: 'Date',
        fr: 'Date',
        ar: 'التاريخ'
      }
    },
    { 
      value: 'amount', 
      label: {
        en: 'Amount',
        fr: 'Montant',
        ar: 'المبلغ'
      }
    },
    { 
      value: 'campaign', 
      label: {
        en: 'Campaign',
        fr: 'Campagne',
        ar: 'الحملة'
      }
    }
  ];

  const getStatusBadge = (statusType, status) => {
    const statusColors = {
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      funded: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors?.[statusType]}`}>
        {status?.[currentLanguage]}
      </span>
    );
  };

  const filteredDonations = donationHistory?.filter(donation => {
    const matchesSearch = donation?.campaignTitle?.[currentLanguage]?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         donation?.studentName?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donation?.statusType === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedDonations = [...filteredDonations]?.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'amount':
        return b?.amount - a?.amount;
      case 'campaign':
        return a?.campaignTitle?.[currentLanguage]?.localeCompare(b?.campaignTitle?.[currentLanguage]);
      default:
        return 0;
    }
  });

  const handleViewCampaign = (campaignId) => {
    navigate(`/campaign-details?id=${campaignId}`);
  };

  const texts = {
    en: {
      title: 'Donation History',
      search: 'Search campaigns...',
      statusFilter: 'Filter by Status',
      sortBy: 'Sort by',
      campaign: 'Campaign',
      student: 'Student',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      progress: 'Progress',
      actions: 'Actions',
      view: 'View',
      anonymous: 'Anonymous Donation',
      noResults: 'No donations found matching your criteria.'
    },
    fr: {
      title: 'Historique des Dons',
      search: 'Rechercher des campagnes...',
      statusFilter: 'Filtrer par Statut',
      sortBy: 'Trier par',
      campaign: 'Campagne',
      student: 'Étudiant',
      amount: 'Montant',
      date: 'Date',
      status: 'Statut',
      progress: 'Progrès',
      actions: 'Actions',
      view: 'Voir',
      anonymous: 'Don Anonyme',
      noResults: 'Aucun don trouvé correspondant à vos critères.'
    },
    ar: {
      title: 'تاريخ التبرعات',
      search: 'البحث في الحملات...',
      statusFilter: 'تصفية حسب الحالة',
      sortBy: 'ترتيب حسب',
      campaign: 'الحملة',
      student: 'الطالب',
      amount: 'المبلغ',
      date: 'التاريخ',
      status: 'الحالة',
      progress: 'التقدم',
      actions: 'الإجراءات',
      view: 'عرض',
      anonymous: 'تبرع مجهول',
      noResults: 'لم يتم العثور على تبرعات تطابق معاييرك.'
    }
  };

  const t = texts?.[currentLanguage];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-4 sm:mb-0">
          {t?.title}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="search"
            placeholder={t?.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full sm:w-64"
          />
          
          <Select
            options={statusOptions?.map(option => ({
              value: option?.value,
              label: option?.label?.[currentLanguage]
            }))}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder={t?.statusFilter}
            className="w-full sm:w-48"
          />
          
          <Select
            options={sortOptions?.map(option => ({
              value: option?.value,
              label: option?.label?.[currentLanguage]
            }))}
            value={sortBy}
            onChange={setSortBy}
            placeholder={t?.sortBy}
            className="w-full sm:w-32"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-body font-medium text-muted-foreground">
                {t?.campaign}
              </th>
              <th className="text-left py-3 px-4 font-body font-medium text-muted-foreground">
                {t?.student}
              </th>
              <th className="text-left py-3 px-4 font-body font-medium text-muted-foreground">
                {t?.amount}
              </th>
              <th className="text-left py-3 px-4 font-body font-medium text-muted-foreground">
                {t?.date}
              </th>
              <th className="text-left py-3 px-4 font-body font-medium text-muted-foreground">
                {t?.status}
              </th>
              <th className="text-left py-3 px-4 font-body font-medium text-muted-foreground">
                {t?.progress}
              </th>
              <th className="text-left py-3 px-4 font-body font-medium text-muted-foreground">
                {t?.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDonations?.length > 0 ? (
              sortedDonations?.map((donation) => (
                <tr key={donation?.id} className="border-b border-border hover:bg-muted/50 transition-colors duration-200">
                  <td className="py-4 px-4">
                    <div className="max-w-xs">
                      <p className="font-body font-medium text-foreground truncate">
                        {donation?.campaignTitle?.[currentLanguage]}
                      </p>
                      {donation?.isAnonymous && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t?.anonymous}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-body text-foreground">
                      {donation?.studentName}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-body font-medium text-foreground">
                      {donation?.amount?.toLocaleString()} {donation?.currency}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-body text-muted-foreground">
                      {donation?.date?.toLocaleDateString(currentLanguage === 'ar' ? 'ar-MA' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(donation?.statusType, donation?.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${donation?.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-body text-muted-foreground">
                        {donation?.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCampaign(donation?.campaignId)}
                      iconName="ExternalLink"
                      iconPosition="right"
                    >
                      {t?.view}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-8 px-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Icon name="Search" size={48} className="text-muted-foreground" />
                    <p className="font-body text-muted-foreground">
                      {t?.noResults}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationHistoryTable;
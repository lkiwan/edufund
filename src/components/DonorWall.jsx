import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';
import Icon from './AppIcon';
import { formatCurrency } from '../utils/currency';

const DonorWall = ({ campaignId }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const [donorWall, setDonorWall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      fetchDonorWall();
    }
  }, [campaignId]);

  const fetchDonorWall = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/donor-wall`);
      const data = await response.json();
      if (data.success) {
        setDonorWall(data.donorWall);
      }
    } catch (err) {
      console.error('Error fetching donor wall:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card variant="default" padding="lg">
        <div className="text-center py-8">
          <Icon name="Loader2" size={32} className="text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading donor wall...</p>
        </div>
      </Card>
    );
  }

  if (!donorWall || donorWall.statistics.uniqueDonors === 0) {
    return (
      <Card variant="default" padding="lg">
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No Donors Yet</h3>
          <p className="text-sm text-gray-600">
            Be the first to support this campaign and get the "First Donor" badge!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Donor Statistics */}
      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          Donor Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {donorWall.statistics.uniqueDonors}
            </div>
            <div className="text-sm text-gray-600 mt-1">Unique Donors</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(donorWall.statistics.averageDonation)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Donation</div>
          </div>
        </div>
      </Card>

      {/* First Donor Badge */}
      {donorWall.firstDonor && (
        <Card variant="default" padding="lg" className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Icon name="Award" size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="warning" className="text-xs">
                  <Icon name="Star" size={12} className="mr-1" />
                  First Donor
                </Badge>
              </div>
              <h4 className="font-semibold text-gray-900">{donorWall.firstDonor.name}</h4>
              <p className="text-sm text-gray-600">
                Started this campaign with {formatCurrency(donorWall.firstDonor.amount)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Top Donors Leaderboard */}
      {donorWall.topDonors.length > 0 && (
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Trophy" size={20} className="text-yellow-500" />
            Top Donors
          </h3>
          <div className="space-y-3">
            {donorWall.topDonors.map((donor) => (
              <div
                key={`${donor.name}-${donor.rank}`}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  donor.rank === 1
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Rank Badge */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    donor.rank === 1
                      ? 'bg-yellow-400 text-white text-lg'
                      : donor.rank === 2
                      ? 'bg-gray-300 text-gray-700'
                      : donor.rank === 3
                      ? 'bg-orange-300 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {donor.rank === 1 ? (
                    <Icon name="Crown" size={20} />
                  ) : (
                    `#${donor.rank}`
                  )}
                </div>

                {/* Donor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {donor.name}
                    </h4>
                    {donor.badge && (
                      <Badge variant={donor.rank === 1 ? 'warning' : 'default'} className="text-xs">
                        {donor.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{donor.donationCount} donation{donor.donationCount > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold ${donor.rank === 1 ? 'text-xl text-yellow-600' : 'text-lg text-gray-900'}`}>
                    {formatCurrency(donor.totalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Donors */}
      {donorWall.recentDonors.length > 0 && (
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Clock" size={20} className="text-primary" />
            Recent Donors
          </h3>
          <div className="space-y-3">
            {donorWall.recentDonors.map((donor, index) => (
              <div
                key={`recent-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar
                  src=""
                  alt={donor.name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{donor.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Icon name="Clock" size={12} />
                    <span>{new Date(donor.createdAt).toLocaleDateString()}</span>
                    {donor.isAnonymous && (
                      <>
                        <span>•</span>
                        <Icon name="EyeOff" size={12} />
                        <span>Anonymous</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="font-bold text-primary flex-shrink-0">
                  {formatCurrency(donor.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Call to Action */}
      <Card variant="outline" padding="lg" className="bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="text-center">
          <Icon name="Heart" size={32} className="text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-2">Join Our Donors</h3>
          <p className="text-sm text-gray-600">
            Make a difference today and see your name on the donor wall!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default DonorWall;

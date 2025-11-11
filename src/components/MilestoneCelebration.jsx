import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Icon from './AppIcon';
import Card from './ui/Card';
import { formatCurrency } from '../utils/currency';

const MilestoneCelebration = ({ campaign, onClose }) => {
  const [show, setShow] = useState(false);
  const [milestone, setMilestone] = useState(null);

  useEffect(() => {
    if (campaign && campaign.id && campaign.currentAmount && campaign.goalAmount) {
      const percentage = (campaign.currentAmount / campaign.goalAmount) * 100;
      const reachedMilestone = checkMilestone(percentage);

      if (reachedMilestone) {
        // Check if this milestone has already been shown for this campaign
        const celebrationKey = `milestone_${campaign.id}_${reachedMilestone.level}`;
        const alreadyShown = sessionStorage.getItem(celebrationKey);

        if (!alreadyShown) {
          setMilestone(reachedMilestone);
          setShow(true);
          triggerConfetti(reachedMilestone.level);
          // Mark as shown for this session
          sessionStorage.setItem(celebrationKey, 'true');
        }
      }
    }
  }, [campaign?.id, campaign?.currentAmount, campaign?.goalAmount]); // Use primitive values only

  const checkMilestone = (percentage) => {
    // Define milestone thresholds
    const milestones = [
      { level: 25, emoji: '🎉', color: 'blue', message: 'First Quarter Complete!' },
      { level: 50, emoji: '🚀', color: 'green', message: 'Halfway There!' },
      { level: 75, emoji: '⭐', color: 'orange', message: 'Three Quarters Done!' },
      { level: 100, emoji: '🏆', color: 'yellow', message: 'Goal Achieved!' },
    ];

    // Find the highest milestone reached
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (percentage >= milestones[i].level) {
        return { ...milestones[i], percentage: milestones[i].level };
      }
    }
    return null;
  };

  const triggerConfetti = (level) => {
    const duration = level === 100 ? 5000 : 3000; // Longer for 100%
    const end = Date.now() + duration;

    const colors = {
      25: ['#3B82F6', '#60A5FA', '#93C5FD'], // Blue
      50: ['#10B981', '#34D399', '#6EE7B7'], // Green
      75: ['#F59E0B', '#FBBF24', '#FCD34D'], // Orange
      100: ['#EAB308', '#FACC15', '#FDE047'] // Yellow/Gold
    };

    const confettiColors = colors[level] || colors[25];

    (function frame() {
      confetti({
        particleCount: level === 100 ? 5 : 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: confettiColors
      });
      confetti({
        particleCount: level === 100 ? 5 : 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: confettiColors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Extra celebration for 100%
    if (level === 100) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 160,
          origin: { y: 0.6 },
          colors: confettiColors
        });
      }, 500);
    }
  };

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  if (!show || !milestone) return null;

  const getGradientClass = (color) => {
    const gradients = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      yellow: 'from-yellow-400 to-yellow-500'
    };
    return gradients[color] || gradients.blue;
  };

  return (
    <Modal
      isOpen={show}
      onClose={handleClose}
      title=""
      size="md"
    >
      <Modal.Body>
        <div className="text-center py-6">
          {/* Milestone Emoji */}
          <div className="text-8xl mb-4 animate-bounce">
            {milestone.emoji}
          </div>

          {/* Milestone Message */}
          <h2 className={`text-3xl font-bold bg-gradient-to-r ${getGradientClass(milestone.color)} bg-clip-text text-transparent mb-2`}>
            {milestone.message}
          </h2>

          <p className="text-xl text-gray-700 mb-6">
            {milestone.level}% Funded!
          </p>

          {/* Campaign Stats */}
          <Card variant="default" padding="lg" className="mb-6 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(campaign.currentAmount)}
                </div>
                <div className="text-sm text-gray-600">Raised</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(campaign.goalAmount)}
                </div>
                <div className="text-sm text-gray-600">Goal</div>
              </div>
            </div>
          </Card>

          {/* Encouragement Message */}
          {milestone.level < 100 ? (
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Amazing progress! Keep the momentum going.
              </p>
              <p className="text-sm text-gray-600">
                Only {formatCurrency(campaign.goalAmount - campaign.currentAmount)} left to reach the goal!
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-700 mb-2 font-semibold">
                🎊 Congratulations! The goal has been reached! 🎊
              </p>
              <p className="text-sm text-gray-600">
                This incredible achievement was made possible by the generous support of all donors.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="default"
              onClick={handleClose}
              iconName="Check"
              iconPosition="left"
              className={`bg-gradient-to-r ${getGradientClass(milestone.color)}`}
            >
              Awesome!
            </Button>
            {milestone.level < 100 && (
              <Button
                variant="outline"
                iconName="Share2"
                iconPosition="left"
              >
                Share Milestone
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              {[25, 50, 75, 100].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-full ${
                    milestone.level >= level
                      ? `bg-gradient-to-r ${getGradientClass(milestone.color)}`
                      : 'bg-gray-300'
                  }`}
                  title={`${level}%`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Milestones: 25% • 50% • 75% • 100%
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MilestoneCelebration;

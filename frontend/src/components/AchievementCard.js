import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Lock } from 'lucide-react';

function AchievementCard({ achievement, unlocked }) {
  return (
    <Card 
      className={`glass border-emerald-100 transition-all duration-300 ${
        unlocked 
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg' 
          : 'opacity-60 grayscale'
      }`}
      data-testid={`achievement-${achievement.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`text-4xl ${
            unlocked ? 'animate-bounce' : ''
          }`}>
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-emerald-900">{achievement.title}</h3>
              {unlocked ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-emerald-700">{achievement.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AchievementCard;

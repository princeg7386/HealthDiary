import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

function Profile({ user, onLogout }) {
  return (
    <Layout user={user} onLogout={onLogout} activeTab="profile">
      <div className="max-w-2xl mx-auto space-y-6 fade-in" data-testid="profile-page">
        <div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Profile</h1>
          <p className="text-emerald-700">Your account information</p>
        </div>

        <Card className="glass border-emerald-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-emerald-900">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-700">Name</p>
                <p className="text-lg font-semibold text-emerald-900" data-testid="user-name">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-700">Email</p>
                <p className="text-lg font-semibold text-emerald-900" data-testid="user-email">{user?.email}</p>
              </div>
            </div>

            {user?.created_at && (
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
                <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Member Since</p>
                  <p className="text-lg font-semibold text-emerald-900">
                    {format(new Date(user.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default Profile;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Heart, Thermometer, Weight, Pill, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, trendsRes] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/analytics/trends?days=7')
      ]);
      
      setStats(statsRes.data);
      
      const chartData = trendsRes.data.records.map(record => ({
        date: new Date(record.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bp: record.systolic_bp,
        sugar: record.blood_sugar,
        weight: record.weight,
        hr: record.heart_rate
      }));
      
      setTrends(chartData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} activeTab="dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-emerald-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: 'Total Records',
      value: stats?.total_records || 0,
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Active Medications',
      value: stats?.active_medications || 0,
      icon: Pill,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Blood Pressure',
      value: stats?.latest_vitals?.systolic_bp ? `${stats.latest_vitals.systolic_bp}/${stats.latest_vitals.diastolic_bp}` : 'N/A',
      icon: Heart,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      title: 'Weight',
      value: stats?.latest_vitals?.weight ? `${stats.latest_vitals.weight} kg` : 'N/A',
      icon: Weight,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  return (
    <Layout user={user} onLogout={onLogout} activeTab="dashboard">
      <div className="space-y-8 fade-in" data-testid="dashboard">
        <div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-emerald-700">Here's your health overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="glass border-emerald-100 card-hover" data-testid={`stat-card-${idx}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-700 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-emerald-900" data-testid={`stat-value-${idx}`}>{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {trends.length > 0 && (
          <Card className="glass border-emerald-100" data-testid="trends-chart">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <TrendingUp className="w-5 h-5" />
                7-Day Health Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
                    <XAxis dataKey="date" stroke="#059669" />
                    <YAxis stroke="#059669" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #A7F3D0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="bp" stroke="#EF4444" name="Systolic BP" strokeWidth={2} />
                    <Line type="monotone" dataKey="sugar" stroke="#F59E0B" name="Blood Sugar" strokeWidth={2} />
                    <Line type="monotone" dataKey="weight" stroke="#06B6D4" name="Weight" strokeWidth={2} />
                    <Line type="monotone" dataKey="hr" stroke="#10B981" name="Heart Rate" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {trends.length === 0 && (
          <Card className="glass border-emerald-100">
            <CardContent className="py-12 text-center">
              <Activity className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-emerald-700 text-lg mb-4">No health records yet</p>
              <button
                onClick={() => navigate('/add-vitals')}
                data-testid="add-first-record-btn"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Add your first record →
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
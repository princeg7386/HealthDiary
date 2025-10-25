import { useState, useEffect } from 'react';
import { api } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { History as HistoryIcon, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

function History({ user, onLogout }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response = await api.get('/health-records?days=90');
      setRecords(response.data);
    } catch (error) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await api.delete(`/health-records/${recordId}`);
      setRecords(records.filter(r => r.id !== recordId));
      toast.success('Record deleted');
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} activeTab="history">
        <div className="flex items-center justify-center h-64">
          <p className="text-emerald-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} activeTab="history">
      <div className="space-y-6 fade-in" data-testid="history-page">
        <div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Health History</h1>
          <p className="text-emerald-700">View your past health records</p>
        </div>

        {records.length === 0 ? (
          <Card className="glass border-emerald-100">
            <CardContent className="py-12 text-center">
              <HistoryIcon className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-emerald-700 text-lg">No health records found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record, idx) => (
              <Card key={record.id} className="glass border-emerald-100 card-hover" data-testid={`record-card-${idx}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-emerald-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {format(new Date(record.recorded_at), 'MMMM d, yyyy')}
                      </CardTitle>
                      <p className="text-sm text-emerald-600 mt-1">
                        {format(new Date(record.recorded_at), 'h:mm a')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`delete-record-btn-${idx}`}
                      onClick={() => handleDelete(record.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {record.systolic_bp && (
                      <div className="bg-rose-50 p-3 rounded-lg">
                        <p className="text-xs text-rose-700 mb-1">Blood Pressure</p>
                        <p className="text-lg font-semibold text-rose-900">
                          {record.systolic_bp}/{record.diastolic_bp} mmHg
                        </p>
                      </div>
                    )}
                    {record.blood_sugar && (
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-xs text-amber-700 mb-1">Blood Sugar</p>
                        <p className="text-lg font-semibold text-amber-900">{record.blood_sugar} mg/dL</p>
                      </div>
                    )}
                    {record.weight && (
                      <div className="bg-cyan-50 p-3 rounded-lg">
                        <p className="text-xs text-cyan-700 mb-1">Weight</p>
                        <p className="text-lg font-semibold text-cyan-900">{record.weight} kg</p>
                      </div>
                    )}
                    {record.temperature && (
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xs text-orange-700 mb-1">Temperature</p>
                        <p className="text-lg font-semibold text-orange-900">{record.temperature} °C</p>
                      </div>
                    )}
                    {record.heart_rate && (
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-xs text-emerald-700 mb-1">Heart Rate</p>
                        <p className="text-lg font-semibold text-emerald-900">{record.heart_rate} bpm</p>
                      </div>
                    )}
                  </div>
                  {record.notes && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-700 mb-1">Notes</p>
                      <p className="text-sm text-emerald-900">{record.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default History;
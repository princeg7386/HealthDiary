import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Activity, Save } from 'lucide-react';

function AddVitals({ user, onLogout }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    systolic_bp: '',
    diastolic_bp: '',
    blood_sugar: '',
    weight: '',
    temperature: '',
    heart_rate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        systolic_bp: formData.systolic_bp ? parseInt(formData.systolic_bp) : null,
        diastolic_bp: formData.diastolic_bp ? parseInt(formData.diastolic_bp) : null,
        blood_sugar: formData.blood_sugar ? parseFloat(formData.blood_sugar) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        notes: formData.notes || null,
        recorded_at: new Date().toISOString()
      };

      await api.post('/health-records', payload);
      toast.success('Health record saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout} activeTab="add">
      <div className="max-w-3xl mx-auto fade-in" data-testid="add-vitals-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Record Vitals</h1>
          <p className="text-emerald-700">Log your health measurements</p>
        </div>

        <Card className="glass border-emerald-100 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <Activity className="w-6 h-6" />
              Health Vitals
            </CardTitle>
            <CardDescription>Enter at least one measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="systolic_bp">Systolic BP (mmHg)</Label>
                  <Input
                    id="systolic_bp"
                    data-testid="systolic-input"
                    type="number"
                    placeholder="120"
                    value={formData.systolic_bp}
                    onChange={(e) => setFormData({ ...formData, systolic_bp: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diastolic_bp">Diastolic BP (mmHg)</Label>
                  <Input
                    id="diastolic_bp"
                    data-testid="diastolic-input"
                    type="number"
                    placeholder="80"
                    value={formData.diastolic_bp}
                    onChange={(e) => setFormData({ ...formData, diastolic_bp: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_sugar">Blood Sugar (mg/dL)</Label>
                  <Input
                    id="blood_sugar"
                    data-testid="blood-sugar-input"
                    type="number"
                    step="0.1"
                    placeholder="100"
                    value={formData.blood_sugar}
                    onChange={(e) => setFormData({ ...formData, blood_sugar: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    data-testid="weight-input"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    data-testid="temperature-input"
                    type="number"
                    step="0.1"
                    placeholder="37"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                  <Input
                    id="heart_rate"
                    data-testid="heart-rate-input"
                    type="number"
                    placeholder="72"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  data-testid="notes-input"
                  placeholder="Any observations or symptoms..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-emerald-200 focus:border-emerald-500 min-h-24"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  data-testid="save-record-btn"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white btn-hover"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Record'}
                </Button>
                <Button
                  type="button"
                  data-testid="cancel-btn"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default AddVitals;
import { useState, useEffect } from 'react';
import { api } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Pill, Plus, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

function Medications({ user, onLogout }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    time_of_day: [],
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const response = await api.get('/medications');
      setMedications(response.data);
    } catch (error) {
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.time_of_day.length === 0) {
      toast.error('Please select at least one time of day');
      return;
    }

    try {
      const payload = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString()
      };

      await api.post('/medications', payload);
      toast.success('Medication added successfully!');
      setDialogOpen(false);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'daily',
        time_of_day: [],
        start_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadMedications();
    } catch (error) {
      toast.error('Failed to add medication');
    }
  };

  const handleDelete = async (medId) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;

    try {
      await api.delete(`/medications/${medId}`);
      setMedications(medications.filter(m => m.id !== medId));
      toast.success('Medication deleted');
    } catch (error) {
      toast.error('Failed to delete medication');
    }
  };

  const toggleTimeOfDay = (time) => {
    if (formData.time_of_day.includes(time)) {
      setFormData({
        ...formData,
        time_of_day: formData.time_of_day.filter(t => t !== time)
      });
    } else {
      setFormData({
        ...formData,
        time_of_day: [...formData.time_of_day, time]
      });
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} activeTab="medications">
        <div className="flex items-center justify-center h-64">
          <p className="text-emerald-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} activeTab="medications">
      <div className="space-y-6 fade-in" data-testid="medications-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">Medications</h1>
            <p className="text-emerald-700">Manage your medicine schedule</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white btn-hover" data-testid="add-medication-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md glass" onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="text-emerald-900">Add New Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medicine Name</Label>
                  <Input
                    id="name"
                    data-testid="med-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Aspirin"
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    data-testid="med-dosage-input"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    required
                    placeholder="e.g., 100mg"
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger data-testid="med-frequency-select" className="border-emerald-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="thrice-daily">Thrice Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time of Day</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                      <button
                        key={time}
                        type="button"
                        data-testid={`time-${time.toLowerCase()}-btn`}
                        onClick={() => toggleTimeOfDay(time)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.time_of_day.includes(time)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    data-testid="med-start-date-input"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <Button type="submit" data-testid="submit-medication-btn" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white btn-hover">
                  Add Medication
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {medications.length === 0 ? (
          <Card className="glass border-emerald-100">
            <CardContent className="py-12 text-center">
              <Pill className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-emerald-700 text-lg">No medications added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medications.map((med, idx) => (
              <Card key={med.id} className="glass border-emerald-100 card-hover" data-testid={`med-card-${idx}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-emerald-900 flex items-center gap-2">
                        <Pill className="w-5 h-5" />
                        {med.name}
                      </CardTitle>
                      <CardDescription className="mt-1">{med.dosage}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`delete-med-btn-${idx}`}
                      onClick={() => handleDelete(med.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-900 font-medium">{med.frequency}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {med.time_of_day.map(time => (
                        <span key={time} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                          {time}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-emerald-600">
                      Started: {format(new Date(med.start_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Medications;
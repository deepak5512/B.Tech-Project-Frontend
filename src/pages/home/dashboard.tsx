import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useState, useRef } from "react";
import { Brain, RefreshCw } from "lucide-react";

interface SensorData {
  Time: number;
  Type: string;
  Concentration: number;
  sensor_readings: number[];
}

export default function Dashboard() {
  const [formData, setFormData] = useState<SensorData>({
    Time: 0,
    Type: "",
    Concentration: 0,
    sensor_readings: []
  });
  const [sensorReadingsInput, setSensorReadingsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadMode, setUploadMode] = useState<'form' | 'file'>('form');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRetraining, setIsRetraining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combined prediction (select models and predict both)
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [classifierOptions, setClassifierOptions] = useState<string[]>([]);
  const [regressorOptions, setRegressorOptions] = useState<string[]>([]);
  const [selectedClassifier, setSelectedClassifier] = useState<string>("");
  const [selectedRegressor, setSelectedRegressor] = useState<string>("");
  const [predictFile, setPredictFile] = useState<File | null>(null);
  const predictFileRef = useRef<HTMLInputElement>(null);
  const [isPredictingCombined, setIsPredictingCombined] = useState(false);
  const [predictRows, setPredictRows] = useState<any[]>([]);
  const [predictSummary, setPredictSummary] = useState<{predictedType?: string; predictedConcentration?: number} | null>(null);

  const handleInputChange = (field: keyof SensorData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSensorReadingsChange = (value: string) => {
    setSensorReadingsInput(value);
    // Parse comma-separated values and convert to numbers
    const readings = value.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
    setFormData(prev => ({
      ...prev,
      sensor_readings: readings
    }));
  };

  // Load available models (from backend) once
  const loadModelsIfNeeded = async () => {
    if (modelsLoaded) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/ml/models`);
      if (!res.ok) return;
      const data = await res.json();
      const trained: string[] = data?.trained_models ?? [];
      const clsSet = new Set([
        'logistic_regression','knn','naive_bayes','random_forest_classifier','xgboost_classifier','lda_classifier'
      ]);
      const classifier = trained.filter(n => clsSet.has(n) || n.includes('classifier'));
      const regressor = trained.filter(n => n.includes('regressor') || n === 'linear_regression');
      setClassifierOptions(classifier);
      setRegressorOptions(regressor);
      if (classifier.length && !selectedClassifier) setSelectedClassifier(classifier[0]);
      if (regressor.length && !selectedRegressor) setSelectedRegressor(regressor[0]);
      setModelsLoaded(true);
    } catch {}
  };

  const handlePredictFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setPredictFile(f);
  };

  const handlePredictCombined = async () => {
    if (!predictFile || !selectedClassifier || !selectedRegressor) return;
    setIsPredictingCombined(true);
    setPredictRows([]);
    setPredictSummary(null);
    try {
      const text = await predictFile.text();
      let rows: SensorData[] = [];
      if (predictFile.name.endsWith('.json')) {
        const j = JSON.parse(text);
        rows = Array.isArray(j) ? j : [j];
      } else if (predictFile.name.endsWith('.csv')) {
        rows = parseCSV(text);
      } else {
        setMessage('Please upload JSON or CSV');
        return;
      }

      const payload = rows; // backend expects list of dicts

      // Call both models in parallel
      const [clsRes, regRes] = await Promise.all([
        fetch(`http://localhost:8000/ml/predict-batch/${selectedClassifier}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        fetch(`http://localhost:8000/ml/predict-batch/${selectedRegressor}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
      ]);

      const clsJson = clsRes.ok ? await clsRes.json() : { results: [] };
      const regJson = regRes.ok ? await regRes.json() : { results: [] };

      const clsResults: any[] = clsJson.results || [];
      const regResults: any[] = regJson.results || [];

      const combined = rows.map((r, idx) => {
        const cls = clsResults[idx]?.prediction || {};
        const reg = regResults[idx]?.prediction || {};
        return {
          ...r,
          predicted_type: cls.predicted_type ?? null,
          predicted_concentration: typeof reg.predicted_concentration === 'number' ? Number(reg.predicted_concentration) : null,
        };
      });

      // Summary
      const types = combined.map(c => c.predicted_type).filter(Boolean) as string[];
      const typeMode = types.length ? types.sort((a,b) => types.filter(x=>x===a).length - types.filter(x=>x===b).length).pop() : undefined;
      const concs = combined.map(c => c.predicted_concentration).filter((n): n is number => typeof n === 'number');
      const avgConc = concs.length ? Number((concs.reduce((a,b)=>a+b,0)/concs.length).toFixed(2)) : undefined;

      setPredictRows(combined);
      setPredictSummary({ predictedType: typeMode, predictedConcentration: avgConc });
    } catch (e) {
      console.error(e);
      setMessage('Prediction failed.');
    } finally {
      setIsPredictingCombined(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('http://localhost:8000/sensors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Data added successfully! ID: ${result.id}`);
        // Reset form
        setFormData({
          Time: 0,
          Type: "",
          Concentration: 0,
          sensor_readings: []
        });
        setSensorReadingsInput("");
      } else {
        setMessage('Error adding data to database');
      }
    } catch (error) {
      setMessage('Error connecting to backend');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setMessage("");
    }
  };

  const parseCSV = (csvText: string): SensorData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const data: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'time' || header === 'concentration') {
          data[header === 'time' ? 'Time' : 'Concentration'] = parseInt(value) || 0;
        } else if (header === 'type') {
          data.Type = value;
        } else if (header === 'sensor_readings') {
          data.sensor_readings = value ? value.split(';').map(Number).filter(n => !isNaN(n)) : [];
        }
      });
      
      return data as SensorData;
    });
  };

  const handleFileSubmit = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setMessage("");
    setUploadProgress(0);

    try {
      const fileText = await uploadedFile.text();
      let sensorDataArray: SensorData[] = [];

      if (uploadedFile.name.endsWith('.json')) {
        const jsonData = JSON.parse(fileText);
        sensorDataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else if (uploadedFile.name.endsWith('.csv')) {
        sensorDataArray = parseCSV(fileText);
      } else {
        setMessage('Please upload a JSON or CSV file');
        setIsLoading(false);
        return;
      }

      // Upload data in batches
      const batchSize = 10;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < sensorDataArray.length; i += batchSize) {
        const batch = sensorDataArray.slice(i, i + batchSize);
        
        try {
          const response = await fetch('http://localhost:8000/sensors/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: batch }),
          });

          if (response.ok) {
            successCount += batch.length;
          } else {
            errorCount += batch.length;
          }
        } catch (error) {
          errorCount += batch.length;
        }

        setUploadProgress(Math.round(((i + batchSize) / sensorDataArray.length) * 100));
      }

      if (errorCount === 0) {
        setMessage(`Successfully uploaded ${successCount} records!`);
      } else {
        setMessage(`Uploaded ${successCount} records successfully, ${errorCount} failed.`);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadedFile(null);
      setUploadProgress(0);

    } catch (error) {
      setMessage('Error processing file. Please check the format.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrainModels = async () => {
    setIsRetraining(true);
    setMessage("");

    try {
      // Fetch all sensor data for training
      const response = await fetch('http://localhost:8000/sensors/');
      if (!response.ok) {
        throw new Error('Failed to fetch training data');
      }

      const sensorData = await response.json();
      
      // Train models
      const trainResponse = await fetch('http://localhost:8000/ml/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sensorData),
      });

      if (trainResponse.ok) {
        const result = await trainResponse.json();
        setMessage(`Models retrained successfully! Trained ${result.evaluations_saved} models.`);
      } else {
        const error = await trainResponse.json();
        setMessage(`Training failed: ${error.detail}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="bg-background flex w-full flex-col">
      <SiteHeader heading="Dashboard" />
      <main className="flex flex-col">
        <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add Sensor Data</h2>
              <Button 
                onClick={handleRetrainModels} 
                disabled={isRetraining}
                variant="outline"
              >
                {isRetraining ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retraining...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Retrain ML Models
                  </>
                )}
              </Button>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={uploadMode === 'form' ? 'default' : 'outline'}
                onClick={() => setUploadMode('form')}
              >
                Manual Entry
              </Button>
              <Button
                type="button"
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMode('file')}
              >
                File Upload
              </Button>
            </div>

            {uploadMode === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="number"
                    value={formData.Time}
                    onChange={(e) => handleInputChange('Time', parseInt(e.target.value) || 0)}
                    placeholder="Enter timestamp"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    type="text"
                    value={formData.Type}
                    onChange={(e) => handleInputChange('Type', e.target.value)}
                    placeholder="Enter sensor type"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concentration">Concentration</Label>
                  <Input
                    id="concentration"
                    type="number"
                    value={formData.Concentration}
                    onChange={(e) => handleInputChange('Concentration', parseInt(e.target.value) || 0)}
                    placeholder="Enter concentration value"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensor-readings">Sensor Readings</Label>
                  <Input
                    id="sensor-readings"
                    type="text"
                    value={sensorReadingsInput}
                    onChange={(e) => handleSensorReadingsChange(e.target.value)}
                    placeholder="Enter readings (comma-separated)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter numeric values separated by commas (e.g., 1.5, 2.3, 4.1)
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Adding Data..." : "Add Data to MongoDB"}
              </Button>
            </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload JSON or CSV File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload a JSON or CSV file with sensor data. For CSV, use headers: time, type, concentration, sensor_readings
                    </p>
                  </div>

                  {uploadedFile && (
                    <div className="p-4 border rounded-md bg-muted/50">
                      <p className="text-sm font-medium">Selected file: {uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Size: {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleFileSubmit}
                    disabled={!uploadedFile || isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Uploading..." : "Upload Data to MongoDB"}
                  </Button>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Model Inference (select models and predict both) */}
          <div className="max-w-2xl mt-10 mx-auto w-full space-y-4">
            <h2 className="text-2xl font-bold">Run Inference with Trained Models</h2>
            <p className="text-sm text-muted-foreground">Select one classifier and one regressor, upload a test file, and predict gas type and concentration for each row.</p>

            {/* Load models on focus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" onMouseEnter={loadModelsIfNeeded} onFocus={loadModelsIfNeeded}>
              <div className="space-y-2">
                <Label>Classifier</Label>
                <Select value={selectedClassifier} onValueChange={setSelectedClassifier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select classifier" />
                  </SelectTrigger>
                  <SelectContent>
                    {classifierOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Regressor</Label>
                <Select value={selectedRegressor} onValueChange={setSelectedRegressor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select regressor" />
                  </SelectTrigger>
                  <SelectContent>
                    {regressorOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="predict-file">Upload Test Data (JSON/CSV)</Label>
              <Input id="predict-file" type="file" accept=".json,.csv" onChange={handlePredictFileChange} ref={predictFileRef} className="cursor-pointer" />
            </div>

            <div className="flex gap-3">
              <Button onClick={handlePredictCombined} disabled={isPredictingCombined || !predictFile || !selectedClassifier || !selectedRegressor}>
                {isPredictingCombined ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Predicting...</>) : 'Predict'}
              </Button>
            </div>

            {predictSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Final Predicted Type</p>
                  <p className="text-xl font-semibold">{predictSummary.predictedType ?? '—'}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Avg Predicted Concentration</p>
                  <p className="text-xl font-semibold">{predictSummary.predictedConcentration ?? '—'}</p>
                </div>
              </div>
            )}

            {predictRows.length > 0 && (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Concentration</TableHead>
                      <TableHead>Sensor Readings</TableHead>
                      <TableHead>Predicted Type</TableHead>
                      <TableHead>Predicted Concentration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictRows.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.Time}</TableCell>
                        <TableCell>{r.Type}</TableCell>
                        <TableCell>{r.Concentration}</TableCell>
                        <TableCell className="max-w-[280px] truncate text-xs">{Array.isArray(r.sensor_readings) ? r.sensor_readings.join(', ') : ''}</TableCell>
                        <TableCell>{r.predicted_type ?? '—'}</TableCell>
                        <TableCell>{typeof r.predicted_concentration === 'number' ? r.predicted_concentration.toFixed(2) : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
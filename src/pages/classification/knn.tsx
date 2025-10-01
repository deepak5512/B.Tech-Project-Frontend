import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { RefreshCw, Upload, Brain } from "lucide-react";

interface ModelEvaluation {
  id: string;
  model_name: string;
  model_type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_time: number;
  created_at: string;
}

interface PredictionResult {
  predicted_type: string;
  confidence: number;
  model_type: string;
}

export default function KNNPage() {
  const [evaluations, setEvaluations] = useState<ModelEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('http://localhost:8000/ml/evaluations/knn');
      if (response.ok) {
        const data = await response.json();
        setEvaluations(data.evaluations || []);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleRetrain = async () => {
    setIsTraining(true);
    setMessage("");

    try {
      const response = await fetch('http://localhost:8000/sensors/');
      if (!response.ok) {
        throw new Error('Failed to fetch training data');
      }

      const sensorData = await response.json();
      
      const trainResponse = await fetch('http://localhost:8000/ml/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sensorData),
      });

      if (trainResponse.ok) {
        setMessage("Models retrained successfully!");
        fetchEvaluations();
      } else {
        const error = await trainResponse.json();
        setMessage(`Training failed: ${error.detail}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setMessage("");
    }
  };

  const handlePredict = async () => {
    if (!uploadedFile) {
      setMessage("Please select a file first");
      return;
    }

    setIsPredicting(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://localhost:8000/ml/predict-file/knn', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setPredictionResult(result);
        setMessage("Prediction completed successfully!");
      } else {
        const error = await response.json();
        setMessage(`Prediction failed: ${error.detail}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPredicting(false);
    }
  };

  const latestEvaluation = evaluations[0];

  return (
    <div className="bg-background flex w-full flex-col">
      <SiteHeader heading="KNN Classifier" />
      <main className="flex flex-col max-w-5xl w-full mx-auto">
        <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">K-Nearest Neighbors</h2>
              <p className="text-muted-foreground">
                Train and evaluate KNN model for gas type classification
              </p>
            </div>
            <Button onClick={handleRetrain} disabled={isTraining}>
              {isTraining ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retraining...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Retrain Model
                </>
              )}
            </Button>
          </div>

          {latestEvaluation && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Accuracy</h3>
                <p className="text-2xl font-bold">{latestEvaluation.accuracy?.toFixed(3) || 'N/A'}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Precision</h3>
                <p className="text-2xl font-bold">{latestEvaluation.precision?.toFixed(3) || 'N/A'}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">Recall</h3>
                <p className="text-2xl font-bold">{latestEvaluation.recall?.toFixed(3) || 'N/A'}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground">F1 Score</h3>
                <p className="text-2xl font-bold">{latestEvaluation.f1_score?.toFixed(3) || 'N/A'}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Data Prediction</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-file">Upload Test Data (JSON/CSV)</Label>
                <Input
                  id="test-file"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Upload a file with sensor data to predict gas type
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

              <Button 
                onClick={handlePredict}
                disabled={!uploadedFile || isPredicting}
                className="w-full md:w-auto"
              >
                {isPredicting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Predict Gas Type
                  </>
                )}
              </Button>
            </div>
          </div>

          {predictionResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prediction Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Predicted Gas Type</h4>
                  <p className="text-xl font-bold">{predictionResult.predicted_type}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Confidence</h4>
                  <p className="text-xl font-bold">
                    {predictionResult.confidence ? `${(predictionResult.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
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

          {evaluations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Training History</h3>
              <div className="space-y-2">
                {evaluations.map((evaluation, index) => (
                  <div key={evaluation.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Training #{evaluations.length - index}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(evaluation.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Accuracy: {evaluation.accuracy?.toFixed(3) || 'N/A'}</p>
                        <p className="text-sm">Training Time: {evaluation.training_time?.toFixed(2)}s</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


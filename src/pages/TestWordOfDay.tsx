import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TestWordOfDay() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWordOfDay = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching from API...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/word-of-day/today?language=pt`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ API Response:', result);
      setData(result);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWordOfDay();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Word of Day API</h1>
      
      <div className="space-y-4">
        <Button onClick={fetchWordOfDay} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
        
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <p className="text-red-600">{error}</p>
          </Card>
        )}
        
        {data && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">API Response:</h2>
            
            <div className="space-y-3">
              <div>
                <strong>Success:</strong> {data.success ? 'Yes' : 'No'}
              </div>
              
              {data.data && (
                <>
                  <div>
                    <strong>Word:</strong> {data.data.word}
                  </div>
                  <div>
                    <strong>Reference:</strong> {data.data.reference}
                  </div>
                  <div>
                    <strong>Verse:</strong> {data.data.verse}
                  </div>
                  <div>
                    <strong>Language:</strong> {data.data.language?.name} ({data.data.language?.code})
                  </div>
                  <div>
                    <strong>Date:</strong> {data.data.date}
                  </div>
                  <div>
                    <strong>Devotional Title:</strong> {data.data.devotionalTitle}
                  </div>
                  <div>
                    <strong>Prayer Title:</strong> {data.data.prayerTitle}
                  </div>
                  <div>
                    <strong>Prayer Duration:</strong> {data.data.prayerDuration}
                  </div>
                </>
              )}
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">Raw JSON Response</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { mockCounties } from '@/lib/mock-data';

interface AlertDrafterProps {
  alert: {
    id: string;
    county_id: string;
    alert_type: string;
    severity: string;
    predicted_date: string;
    confidence: number;
    message: string;
  };
  onClose: () => void;
}

export default function AlertDrafter({ alert, onClose }: AlertDrafterProps) {
  const [emailDraft, setEmailDraft] = useState('');
  const [smsDraft, setSmsDraft] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isGeneratingSms, setIsGeneratingSms] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  const county = mockCounties.find(c => c.id === alert.county_id);
  const countyName = county?.countyName || 'Unknown County';

  const generateEmailDraft = async () => {
    setIsGeneratingEmail(true);
    setEmailDraft('');

    // Add initial delay to simulate AI thinking/processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const emailTemplate = `Subject: URGENT: ${alert.alert_type.replace('_', ' ').toUpperCase()} Alert - ${countyName}

Dear Emergency Response Team,

Our AI monitoring system has detected a HIGH RISK ${alert.alert_type.replace('_', ' ')} event predicted for ${countyName} on ${new Date(alert.predicted_date).toLocaleDateString()}.

⚠️ ALERT DETAILS:
• Location: ${countyName}
• Risk Type: ${alert.alert_type.replace('_', ' ').toUpperCase()}
• Severity: ${alert.severity.toUpperCase()}
• Predicted Date: ${new Date(alert.predicted_date).toLocaleDateString()}
• Confidence Level: ${Math.round(alert.confidence * 100)}%

IMMEDIATE ACTIONS REQUIRED:
• Activate emergency response protocols
• Pre-position resources and equipment
• Issue public safety warnings
• Coordinate with local emergency services

This alert was generated using advanced AI analysis of environmental data, weather patterns, and historical risk factors.

Please confirm receipt and action status.

Best regards,
AidVantage AI Alert System`;

    // Simulate streaming character by character
    for (let i = 0; i <= emailTemplate.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 5));
      setEmailDraft(emailTemplate.slice(0, i));
    }

    setIsGeneratingEmail(false);
  };

  const generateSmsDraft = async () => {
    setIsGeneratingSms(true);
    setSmsDraft('');

    // Add initial delay to simulate AI thinking/processing
    await new Promise(resolve => setTimeout(resolve, 1200));

    const smsTemplate = `🚨 URGENT ALERT - ${countyName}

${alert.alert_type.replace('_', ' ').toUpperCase()} risk detected for ${new Date(alert.predicted_date).toLocaleDateString()}

Severity: ${alert.severity.toUpperCase()}
Confidence: ${Math.round(alert.confidence * 100)}%

Activate emergency protocols immediately.

- AidVantage AI`;

    // Simulate streaming character by character
    for (let i = 0; i <= smsTemplate.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 8));
      setSmsDraft(smsTemplate.slice(0, i));
    }

    setIsGeneratingSms(false);
  };

  const copyToClipboard = async (text: string, type: 'email' | 'sms') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedSms(true);
        setTimeout(() => setCopiedSms(false), 2000);
      }
      toast.success(`${type.toUpperCase()} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">AI Alert Drafting</h2>
              <p className="text-muted-foreground">Generate emergency communication for {countyName}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="border-emergency text-emergency">
                  {alert.severity.toUpperCase()}
                </Badge>
                {alert.alert_type.replace('_', ' ').toUpperCase()} - {countyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Predicted Date: {new Date(alert.predicted_date).toLocaleDateString()}</p>
              <p>Confidence: {Math.round(alert.confidence * 100)}%</p>
            </CardContent>
          </Card>

          {/* Email Draft */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Alert Draft
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={generateEmailDraft}
                    disabled={isGeneratingEmail}
                    size="sm"
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isGeneratingEmail ? 'animate-spin' : ''}`} />
                    {isGeneratingEmail ? 'Generating...' : 'Generate'}
                  </Button>
                  {emailDraft && (
                    <Button
                      onClick={() => copyToClipboard(emailDraft, 'email')}
                      size="sm"
                      variant="outline"
                    >
                      {copiedEmail ? (
                        <Check className="h-4 w-4 mr-1 text-success" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {copiedEmail ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                placeholder="Click 'Generate' to create an AI-drafted email alert..."
                className="min-h-[200px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* SMS Draft */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS Alert Draft
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={generateSmsDraft}
                    disabled={isGeneratingSms}
                    size="sm"
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isGeneratingSms ? 'animate-spin' : ''}`} />
                    {isGeneratingSms ? 'Generating...' : 'Generate'}
                  </Button>
                  {smsDraft && (
                    <Button
                      onClick={() => copyToClipboard(smsDraft, 'sms')}
                      size="sm"
                      variant="outline"
                    >
                      {copiedSms ? (
                        <Check className="h-4 w-4 mr-1 text-success" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {copiedSms ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={smsDraft}
                onChange={(e) => setSmsDraft(e.target.value)}
                placeholder="Click 'Generate' to create an AI-drafted SMS alert..."
                className="min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Character count: {smsDraft.length}/160
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
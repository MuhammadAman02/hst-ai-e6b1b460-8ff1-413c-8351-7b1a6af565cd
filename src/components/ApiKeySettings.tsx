import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings, Eye, EyeOff, Key, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
}

const ApiKeySettings = ({ isOpen, onClose, onApiKeySet, currentApiKey }: ApiKeySettingsProps) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  console.log('ApiKeySettings rendered, isOpen:', isOpen);

  const validateApiKey = (key: string): boolean => {
    // OpenAI API keys start with 'sk-' and are typically 51 characters long
    return key.startsWith('sk-') && key.length >= 20;
  };

  const handleSave = async () => {
    console.log('Saving API key...');
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    if (!validateApiKey(apiKey)) {
      toast({
        title: "Invalid API Key",
        description: "OpenAI API keys should start with 'sk-' and be at least 20 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        onApiKeySet(apiKey);
        localStorage.setItem('openai_api_key', apiKey);
        toast({
          title: "Success",
          description: "API key saved and validated successfully!",
        });
        onClose();
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      console.error('API key validation failed:', error);
      toast({
        title: "Invalid API Key",
        description: "The API key could not be validated. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setApiKey('');
    onApiKeySet('');
    localStorage.removeItem('openai_api_key');
    toast({
      title: "API Key Removed",
      description: "Your API key has been removed from local storage.",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            OpenAI API Key Settings
          </CardTitle>
          <CardDescription>
            Enter your OpenAI API key to enable chat functionality. Your key is stored locally and never sent to our servers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-800 mb-1">How to get your API key:</p>
            <ol className="text-blue-700 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI API Keys</a></li>
              <li>Sign in to your OpenAI account</li>
              <li>Click "Create new secret key"</li>
              <li>Copy and paste the key here</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isValidating}
              className="flex-1"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Key
                </>
              )}
            </Button>
            
            {currentApiKey && (
              <Button
                onClick={handleRemove}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySettings;
import React, { useState } from 'react';
import {
  Box, Typography, Stepper, Step, StepLabel, Button, Card,
  CardContent, Alert, CircularProgress,
} from '@mui/material';
import UploadStep from '../components/UploadStep';
import PreviewStep from '../components/PreviewStep';
import SettingsStep from '../components/SettingsStep';
import CompleteStep from '../components/CompleteStep';

const steps = ['대화 업로드', '미리보기', '책 설정', '완료'];

export default function CreatePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [parsedChat, setParsedChat] = useState<any>(null);
  const [bookSettings, setBookSettings] = useState<any>(null);
  const [createdBook, setCreatedBook] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <UploadStep
            onParsed={(data: any) => {
              setParsedChat(data);
              handleNext();
            }}
            setError={setError}
            setLoading={setLoading}
          />
        );
      case 1:
        return (
          <PreviewStep
            parsedChat={parsedChat}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <SettingsStep
            parsedChat={parsedChat}
            onCreated={(book: any) => {
              setCreatedBook(book);
              handleNext();
            }}
            onBack={handleBack}
            setError={setError}
            setLoading={setLoading}
          />
        );
      case 3:
        return <CompleteStep createdBook={createdBook} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📖 대화를 책으로 만들기
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Card elevation={0} sx={{ border: '1px solid #eee' }}>
          <CardContent sx={{ p: 4 }}>
            {renderStep()}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

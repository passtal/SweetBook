import React, { useState } from 'react';
import {
  Box, Typography, Stepper, Step, StepLabel,
  Alert, CircularProgress,
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
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '1.6rem',
          color: '#191F28',
          letterSpacing: '-0.02em',
          mb: 3,
        }}
      >
        대화를 책으로 만들기
      </Typography>

      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
          '& .MuiStepLabel-label': { fontWeight: 600, fontSize: '0.9rem' },
          '& .MuiStepLabel-label.Mui-active': { color: '#3182F6' },
          '& .MuiStepLabel-label.Mui-completed': { color: '#3CB371' },
          '& .MuiStepIcon-root.Mui-active': { color: '#3182F6' },
          '& .MuiStepIcon-root.Mui-completed': { color: '#3CB371' },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: '#3182F6' }} />
        </Box>
      )}

      {!loading && (
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: '20px',
            bgcolor: 'white',
            border: '1px solid #F2F4F6',
          }}
        >
          {renderStep()}
        </Box>
      )}
    </Box>
  );
}

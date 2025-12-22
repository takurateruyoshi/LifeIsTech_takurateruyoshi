import React from 'react';
import { Container, Typography, Paper, Grid, Alert, Button } from '@mui/material';

const Result = () => {
    const result = JSON.parse(localStorage.getItem('lastResult') || '{}');

    return (
        <Container>
            <Typography variant="h4" sx={{ my: 4 }}>Analysis Result</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                前回の分析より <strong>{result.growth_diff}</strong> 成長しました！
            </Alert>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">今回の強み抽出</Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>{result.summary}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6">アドバイス</Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>{result.feedback}</Typography>
                    </Paper>
                </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 4 }} onClick={() => window.location.href='/es-generator'}>
                この強みをESに反映する
            </Button>
        </Container>
    );
};
export default Result;
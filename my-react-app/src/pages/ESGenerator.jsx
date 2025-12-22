import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper } from '@mui/material';
import { generateES } from '../api/client';

const ESGenerator = () => {
    const [content, setContent] = useState('');

    const handleGenerate = async () => {
        const res = await generateES();
        setContent(res.content);
    };

    return (
        <Container>
            <Typography variant="h4" sx={{ my: 4 }}>ES Draft Generator</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                    これまでの成長ログに基づき、AIが最適な自己PRを作成します。
                </Typography>
                <Button variant="contained" onClick={handleGenerate}>文章を生成する</Button>
            </Paper>
            <TextField 
                fullWidth multiline rows={15} variant="filled"
                value={content} onChange={(e) => setContent(e.target.value)}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => window.print()}>PDFとして保存</Button>
            </Box>
        </Container>
    );
};
export default ESGenerator;
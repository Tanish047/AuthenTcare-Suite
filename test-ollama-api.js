/**
 * Test Ollama API directly to debug timeout issues
 */

async function testOllamaAPI() {
    console.log('🧪 Testing Ollama API directly...');
    
    const testPrompt = `You are a regulatory AI assistant. Please provide a brief response about FDA 510k requirements.

User Question: What is FDA 510k?

Please provide a comprehensive, detailed response that includes:
1. Direct answer to the question
2. Relevant regulatory requirements and standards
3. Step-by-step processes where applicable

Format your response with clear headings and actionable guidance.`;

    const requestBody = {
        model: 'llama3.2:1b',
        prompt: testPrompt,
        stream: false,
        options: {
            temperature: 0.7,
            num_predict: 1000,
            top_p: 0.9,
            top_k: 40,
            num_ctx: 2048,
            num_batch: 512,
            num_gpu: 0,
            low_vram: true
        }
    };

    try {
        console.log('📤 Sending request to Ollama...');
        console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));
        
        const startTime = Date.now();
        
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(120000) // 2 minute timeout
        });

        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️ Request took: ${duration}ms (${(duration/1000).toFixed(1)}s)`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, errorText);
            return;
        }

        const data = await response.json();
        console.log('✅ Response received!');
        console.log('📄 Response length:', data.response?.length || 0, 'characters');
        console.log('📝 Response preview:', data.response?.substring(0, 200) + '...');
        
        // Performance metrics
        if (data.eval_count && data.eval_duration) {
            const tokensPerSecond = data.eval_count / (data.eval_duration / 1000000000);
            console.log(`🚀 Performance: ${data.eval_count} tokens in ${(data.eval_duration / 1000000000).toFixed(1)}s (${tokensPerSecond.toFixed(1)} tokens/sec)`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.name === 'TimeoutError') {
            console.log('⚠️ Request timed out - model might be loading for the first time');
            console.log('💡 Try running: ollama run llama3.2:1b "hello" to warm up the model');
        }
    }
}

// Run the test
testOllamaAPI().then(() => {
    console.log('🏁 Test complete');
}).catch(error => {
    console.error('💥 Test crashed:', error);
});
/**
 * Ollama Status Checker - Diagnose E:\ drive model setup
 */

async function checkOllamaStatus() {
    console.log('🔍 Checking Ollama Status...\n');
    
    try {
        // Check if Ollama service is running
        console.log('1️⃣ Testing Ollama service connection...');
        const response = await fetch('http://localhost:11434/api/tags', {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            console.log('✅ Ollama service is running');
            
            // Get available models
            const data = await response.json();
            const models = data.models || [];
            
            console.log(`\n2️⃣ Available models: ${models.length}`);
            models.forEach((model, index) => {
                console.log(`   ${index + 1}. ${model.name} (${model.size || 'Unknown size'})`);
            });
            
            if (models.length === 0) {
                console.log('❌ No models found');
                console.log('\n🔧 Solutions:');
                console.log('   • Install a model: ollama pull phi3:mini');
                console.log('   • Check model directory: echo %OLLAMA_MODELS%');
                console.log('   • Verify E:\\ drive models exist');
            } else {
                // Test smallest model
                console.log('\n3️⃣ Testing smallest model...');
                const smallestModel = models.find(m => m.name.includes('1b')) || 
                                   models.find(m => m.name.includes('3b')) || 
                                   models.find(m => m.name.includes('mini')) || 
                                   models[0];
                
                console.log(`🧪 Testing model: ${smallestModel.name}`);
                
                try {
                    const testResponse = await fetch('http://localhost:11434/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: smallestModel.name,
                            prompt: 'Hello, please respond with just "I am working correctly"',
                            stream: false,
                            options: {
                                temperature: 0.1,
                                num_predict: 50
                            }
                        }),
                        signal: AbortSignal.timeout(30000)
                    });
                    
                    if (testResponse.ok) {
                        const testData = await testResponse.json();
                        console.log('✅ Model test successful!');
                        console.log(`📝 Response: ${testData.response}`);
                        
                        console.log('\n🎉 DIAGNOSIS: Your Ollama setup is working!');
                        console.log('💡 The issue might be in the application code, not Ollama.');
                        
                    } else {
                        const errorText = await testResponse.text();
                        console.log('❌ Model test failed');
                        console.log(`📝 Error: ${errorText}`);
                        
                        if (errorText.includes('system memory')) {
                            console.log('\n🚨 MEMORY ISSUE CONFIRMED');
                            console.log('💡 Try even smaller model: ollama pull llama3.2:1b');
                        }
                    }
                } catch (testError) {
                    console.log('❌ Model test error:', testError.message);
                }
            }
            
        } else {
            console.log('❌ Ollama service not responding');
            console.log(`📝 Status: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.log('❌ Cannot connect to Ollama service');
        console.log(`📝 Error: ${error.message}`);
        
        console.log('\n🔧 Solutions:');
        console.log('   • Start Ollama: ollama serve');
        console.log('   • Check if port 11434 is available');
        console.log('   • Verify Ollama is installed');
    }
    
    console.log('\n📋 Environment Check:');
    console.log('   • OLLAMA_MODELS should point to E:\\ drive');
    console.log('   • Run: echo %OLLAMA_MODELS%');
    console.log('   • Should show: E:\\ollama\\models (or similar)');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Fix any issues shown above');
    console.log('   2. Test: ollama run phi3:mini "Hello"');
    console.log('   3. Open app and click "🧪 Test AI"');
}

// Run the diagnostic
checkOllamaStatus().catch(console.error);
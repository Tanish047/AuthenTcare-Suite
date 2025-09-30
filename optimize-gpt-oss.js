/**
 * Optimize gpt-oss:20b for better performance
 */

async function optimizeModel() {
  console.log('🔧 Optimizing gpt-oss:20b for better performance...\n');

  // Test with optimized parameters
  const optimizedParams = {
    model: "gpt-oss:20b",
    prompt: "What are FDA Class II medical device requirements?",
    stream: false,
    options: {
      temperature: 0.3,        // Lower for more focused responses
      top_p: 0.8,             // Reduce randomness
      top_k: 20,              // Limit vocabulary
      num_predict: 150,       // Limit response length
      num_ctx: 2048,          // Reduce context window
      repeat_penalty: 1.1,    // Prevent repetition
      seed: 42                // Consistent responses
    }
  };

  try {
    console.log('Testing optimized parameters...');
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(optimizedParams),
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    const result = await response.json();
    const duration = (Date.now() - startTime) / 1000;

    if (result.response && result.response.trim()) {
      console.log('✅ Optimization successful!');
      console.log(`📝 Response: "${result.response.substring(0, 200)}..."`);
      console.log(`⏱️  Time: ${duration}s`);
      console.log(`🧠 Tokens: ${result.eval_count || 'N/A'}`);
      
      return {
        success: true,
        optimizedParams: optimizedParams.options,
        responseTime: duration
      };
    } else {
      console.log('❌ Still getting empty responses');
      return { success: false, reason: 'empty_response' };
    }

  } catch (error) {
    console.log(`❌ Optimization failed: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

// Run optimization
optimizeModel().then(result => {
  if (result.success) {
    console.log('\n🎉 Your gpt-oss:20b is now optimized!');
    console.log('\n📋 Recommended settings for your AI Knowledge Base:');
    console.log(JSON.stringify(result.optimizedParams, null, 2));
  } else {
    console.log('\n💡 Consider using a smaller, faster model:');
    console.log('   ollama pull llama3.1:8b    # Good balance of speed/quality');
    console.log('   ollama pull phi3:mini      # Very fast, smaller');
    console.log('   ollama pull mistral:7b     # Good for regulatory questions');
  }
}).catch(console.error);
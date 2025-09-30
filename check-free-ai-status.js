/**
 * Free AI Status Checker
 * Run this to see what's available on your system
 */

async function checkFreeAIStatus() {
  console.log('🔍 Checking Free AI Status...\n');
  
  const status = {
    ollama: false,
    chromadb: false,
    recommendations: []
  };

  // Check Ollama (Local AI)
  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    
    if (ollamaResponse.ok) {
      const models = await ollamaResponse.json();
      status.ollama = true;
      console.log('✅ Ollama: AVAILABLE');
      console.log(`   Models: ${models.models?.map(m => m.name).join(', ') || 'None'}`);
    }
  } catch (error) {
    console.log('❌ Ollama: NOT AVAILABLE');
    console.log('   Install: https://ollama.ai/download/windows');
    status.recommendations.push({
      service: 'Ollama',
      benefit: 'Unlimited AI queries',
      install: 'Download from https://ollama.ai/download/windows'
    });
  }

  // Check ChromaDB (Vector Database)
  try {
    const chromaResponse = await fetch('http://localhost:8000/api/v1/heartbeat', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    
    if (chromaResponse.ok) {
      status.chromadb = true;
      console.log('✅ ChromaDB: AVAILABLE');
      console.log('   Storage: Unlimited documents');
    }
  } catch (error) {
    console.log('❌ ChromaDB: NOT AVAILABLE');
    console.log('   Install: pip install chromadb');
    status.recommendations.push({
      service: 'ChromaDB',
      benefit: 'Unlimited document storage',
      install: 'pip install chromadb && chroma run --host localhost --port 8000'
    });
  }

  console.log('\n📊 Summary:');
  
  if (status.ollama && status.chromadb) {
    console.log('🎉 PERFECT! You have unlimited AI + unlimited storage');
    console.log('💰 Monthly cost: $0 (vs $200-2000 for paid services)');
  } else if (status.ollama) {
    console.log('🤖 GOOD! You have unlimited AI');
    console.log('📚 Optional: Add ChromaDB for unlimited document storage');
  } else {
    console.log('🆓 WORKING! Using mock AI responses (great for testing)');
    console.log('⚡ Optional: Add Ollama for real AI responses');
  }

  if (status.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    status.recommendations.forEach(rec => {
      console.log(`   ${rec.service}: ${rec.benefit}`);
      console.log(`   Install: ${rec.install}\n`);
    });
  }

  console.log('\n🚀 Your AI Knowledge Base works in all cases!');
  return status;
}

// Run the check
checkFreeAIStatus().catch(console.error);
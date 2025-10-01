# Ollama E:\ Drive Setup Guide

## 🎯 **Objective**
Configure Ollama to use models stored on your E:\ drive and access them through the Regulatory AI Chat.

## 🔍 **How Ollama Works**

### **Model Storage vs Model Access**
- **Storage**: Where model files are physically stored (E:\ drive)
- **Access**: How applications access models (through Ollama service)

### **Two Ways to Use Models**
1. **Through Ollama Service** ✅ (Recommended)
   - Models accessed via `http://localhost:11434`
   - Works with any storage location
   - Our app uses this method

2. **Direct File Access** ❌ (Complex)
   - Requires loading model files directly
   - Not recommended for applications

## 🔧 **Setup Steps**

### **Step 1: Configure Ollama Model Path**

#### **Option A: Environment Variable (Recommended)**
```bash
# Set Ollama model directory to E:\ drive
set OLLAMA_MODELS=E:\ollama\models

# Or add to system environment variables permanently
setx OLLAMA_MODELS "E:\ollama\models"
```

#### **Option B: Move Models to E:\ Drive**
```bash
# If models are currently elsewhere, move them
move "%USERPROFILE%\.ollama\models\*" "E:\ollama\models\"
```

### **Step 2: Start Ollama Service**
```bash
# Start Ollama service (will use E:\ drive models)
ollama serve
```

### **Step 3: Verify Models are Accessible**
```bash
# List available models (should show your E:\ drive models)
ollama list

# Test a model
ollama run phi3:mini "Hello, are you working?"
```

### **Step 4: Test in Regulatory AI Chat**
1. Open the application
2. Navigate to AI Knowledge Base → AI Assistant
3. Click "🧪 Test AI" button
4. Should show your E:\ drive models and work properly

## 📋 **Current Implementation**

### **What Our App Does**
```javascript
// 1. Connects to Ollama service
const response = await fetch('http://localhost:11434/api/tags');

// 2. Gets available models (from E:\ drive)
const models = data.models; // Your E:\ models appear here

// 3. Uses models for generation
const response = await fetch('http://localhost:11434/api/generate', {
    body: JSON.stringify({
        model: 'phi3:mini', // Your E:\ model
        prompt: 'Your question...'
    })
});
```

### **What Ollama Does**
1. **Reads models** from E:\ drive (via OLLAMA_MODELS env var)
2. **Loads model** into RAM when requested
3. **Serves responses** via HTTP API
4. **Manages memory** and model lifecycle

## ✅ **Verification Steps**

### **1. Check Environment Variable**
```bash
echo %OLLAMA_MODELS%
# Should show: E:\ollama\models
```

### **2. Check Ollama Service**
```bash
# Should show models from E:\ drive
ollama list
```

### **3. Test Model Access**
```bash
# Should work with E:\ drive model
ollama run phi3:mini "Test message"
```

### **4. Test HTTP API**
```bash
# Should return models from E:\ drive
curl http://localhost:11434/api/tags
```

### **5. Test in Application**
- Click "🔄 Refresh Models" - should show E:\ models
- Click "🧪 Test AI" - should work with E:\ models
- Ask a question - should get AI response

## 🚨 **Troubleshooting**

### **Models Not Found**
```bash
# Check if OLLAMA_MODELS is set correctly
echo %OLLAMA_MODELS%

# Check if models exist in E:\ drive
dir "E:\ollama\models"

# Restart Ollama service
ollama serve
```

### **Memory Errors (59.5GB)**
```bash
# Use smaller models from your E:\ drive
ollama run llama3.2:1b    # ~2GB RAM
ollama run phi3:mini      # ~3GB RAM
ollama run qwen2.5:3b     # ~4GB RAM

# Avoid large models
# ollama run llama3.1:8b  # ~10GB RAM (might be too large)
```

### **Service Not Running**
```bash
# Start Ollama service
ollama serve

# Check if running
curl http://localhost:11434/api/tags
```

## 🎯 **Expected Results**

### **After Proper Setup**
- ✅ **Ollama finds models** on E:\ drive
- ✅ **App detects models** via HTTP API
- ✅ **Models load properly** without memory errors
- ✅ **AI responses work** in Regulatory Chat
- ✅ **No online dependencies** - fully local

### **In the Application**
- **Model dropdown** shows your E:\ drive models
- **Status shows** "🖥️ phi3:mini (4 models available)"
- **Test AI button** succeeds with actual responses
- **Chat works** with intelligent regulatory guidance

## 📝 **Summary**

**The key insight**: Your E:\ drive models work through Ollama's HTTP service. Our application doesn't need to know where models are stored - it just needs Ollama service running and configured to use your E:\ drive location.

**Configuration**: Set `OLLAMA_MODELS=E:\ollama\models` and restart Ollama service.

**Result**: Full local AI functionality using your existing E:\ drive models!
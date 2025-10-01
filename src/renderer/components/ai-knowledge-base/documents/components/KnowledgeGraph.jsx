import React from 'react';

/**
 * Knowledge Graph - Visualize document relationships
 */
const KnowledgeGraph = ({
  documents,
  selectedDocument,
  onDocumentSelect,
  onDocumentAnalyze,
  onDocumentDelete,
  isProcessing,
  ragStats,
}) => {
  return (
    <div className="knowledge-graph">
      <h2>Knowledge Graph</h2>
      <p>Visualize relationships and connections between documents</p>

      {/* Knowledge graph will be implemented with visualization library */}
      <div className="graph-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">🕸️</div>
          <h3>Knowledge Graph Coming Soon</h3>
          <p>Interactive visualization of document relationships and knowledge connections.</p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;

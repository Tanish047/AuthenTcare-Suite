
import path from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { GenerateSW } from 'workbox-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

export default {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'inline-source-map',
  
  entry: {
    main: './src/renderer/index.jsx',
  },
  
  output: {
    path: path.join(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
    clean: true,
    publicPath: './',
  },
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
        },
        // React and React-DOM
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
          chunks: 'all',
        },
        // AI and ML libraries
        ai: {
          test: /[\\/]node_modules[\\/](@xenova|openai|cohere|pinecone)[\\/]/,
          name: 'ai-libs',
          priority: 15,
          chunks: 'all',
        },
        // Common utilities
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
    usedExports: true,
    sideEffects: false,
  },
  
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { 
                targets: { electron: '37' },
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3,
              }],
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
            plugins: [
              // Enable dynamic imports for code splitting
              '@babel/plugin-syntax-dynamic-import',
              // Tree shaking for React components
              ['babel-plugin-transform-react-remove-prop-types', { mode: 'remove' }],
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                auto: true,
                localIdentName: isProduction ? '[hash:base64:8]' : '[name]__[local]--[hash:base64:5]',
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[hash][ext]',
        },
      },
    ],
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'blocking',
    }),
    
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'public', 
          to: '.', 
          globOptions: { 
            ignore: ['**/index.html'] 
          },
          noErrorOnMissing: true
        },
      ],
    }),
    
    // Bundle analyzer (only when requested)
    ...(shouldAnalyze ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html',
      }),
    ] : []),
    
    // Service Worker for caching (production only)
    ...(isProduction ? [
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
        ],
      }),
    ] : []),
  ],
  
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@main': path.resolve(__dirname, 'src/main'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@components': path.resolve(__dirname, 'src/renderer/components'),
      '@utils': path.resolve(__dirname, 'src/renderer/utils'),
    },
  },
  
  // Performance hints
  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 512000, // 500kb
    maxAssetSize: 512000, // 500kb
  },
  
  // Development server configuration
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Use the same hardcoded key
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key="AIzaSyAfWCNcYxHgiJAlMDq8sslhx-Jd9oZu2iM")
texts = ["Hello, world!"]
result = embeddings.embed_documents(texts)
print("Embedding successful:", result[:5])
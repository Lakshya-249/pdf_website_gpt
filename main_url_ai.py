from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
import os

from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from langchain.document_loaders import UnstructuredURLLoader
from dotenv import load_dotenv
from sqlalchemy import true



def generate_text_from_url(urls):
    loader = UnstructuredURLLoader(urls=urls)
    text = loader.load()
    return text

def split_url_text_into_chunks(urls):
    doc = generate_text_from_url(urls)
    doc_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = doc_splitter.split_documents(doc)
    return chunks

def create_url_vectorstore(chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.from_documents(chunks,embedding=embeddings)
    vectorstore.save_local("faiss_index")
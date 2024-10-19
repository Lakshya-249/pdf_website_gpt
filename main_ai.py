from langchain.text_splitter import RecursiveCharacterTextSplitter
from PyPDF2 import PdfReader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
import os

from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from sqlalchemy import true

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))



def generate_text_from_pdf(pdf_docs):
    text = ""
    for pdf_doc in pdf_docs:
        pdf_reader = PdfReader(pdf_doc)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def split_text_into_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_text(text)
    return chunks

def create_vectorstore(chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.from_texts(chunks,embedding=embeddings)
    vectorstore.save_local("faiss_index")

def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible and do not provide wrong answers from the context
    Context : \n {context}?\n
    Question : \n {question}\n

    Answer: 
    """
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro",temperature=0.3)

    prompt = PromptTemplate(template=prompt_template,input_variables=["context","question"])
    chain = load_qa_chain(llm,chain_type="stuff",prompt=prompt)

    return chain

def user_query(question):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

    new_db = FAISS.load_local("faiss_index",embeddings,allow_dangerous_deserialization=True)
    docs = new_db.similarity_search(question)

    chain = get_conversational_chain()

    response = chain({
        "input_documents": docs,
        "question": question
    }, return_only_outputs=true )

    return response
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from pydantic import BaseModel
from database import SessionLocal, Produto, Pedido, ItemPedido, engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

class RelatorioItem(BaseModel):
    nome: str
    quantidade_vendida: int
    estoque_restante: int
    valor_vendido: float

class RelatorioResponse(BaseModel):
    itens: List[RelatorioItem]
    total_vendido: float

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProdutoBase(BaseModel):
    nome: str
    preco: float
    estoque: int

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoUpdate(ProdutoBase):
    pass

class ProdutoResponse(ProdutoBase):
    id: int

    class Config:
        orm_mode = True

class ItemPedidoBase(BaseModel):
    produto_id: int
    quantidade: int

class ItemPedidoResponse(BaseModel):
    produto_id: int
    quantidade: int
    produto: ProdutoResponse

    class Config:
        orm_mode = True

class PedidoResponse(BaseModel):
    id: int
    itens: List[ItemPedidoResponse]

    class Config:
        orm_mode = True

@app.post("/produtos/", response_model=ProdutoResponse)
def create_produto(produto: ProdutoCreate, db: Session = Depends(get_db)):
    db_produto = Produto(**produto.dict())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

@app.get("/produtos/", response_model=List[ProdutoResponse])
def read_produtos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    produtos = db.query(Produto).offset(skip).limit(limit).all()
    return produtos

@app.put("/produtos/{produto_id}", response_model=ProdutoResponse)
def update_produto(produto_id: int, produto: ProdutoUpdate, db: Session = Depends(get_db)):
    db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    for key, value in produto.dict().items():
        setattr(db_produto, key, value)
    db.commit()
    db.refresh(db_produto)
    return db_produto

@app.delete("/produtos/{produto_id}", response_model=ProdutoResponse)
def delete_produto(produto_id: int, db: Session = Depends(get_db)):
    db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    db.delete(db_produto)
    db.commit()
    return db_produto

@app.post("/pedidos/", response_model=PedidoResponse)
def create_pedido(itens: List[ItemPedidoBase], db: Session = Depends(get_db)):
    pedido = Pedido()
    db.add(pedido)
    db.commit()
    db.refresh(pedido)

    itens_detalhados = []
    for item in itens:
        db_produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
        if db_produto is None or db_produto.estoque < item.quantidade:
            raise HTTPException(status_code=400, detail="Estoque insuficiente ou produto não encontrado")
        db_produto.estoque -= item.quantidade
        item_pedido = ItemPedido(produto=db_produto, pedido_id=pedido.id, quantidade=item.quantidade)
        db.add(item_pedido)
        db.commit()
        db.refresh(item_pedido)
        itens_detalhados.append(item_pedido)
    
    pedido.itens = itens_detalhados
    db.commit()
    db.refresh(pedido)
    
    return pedido

@app.get("/pedidos/", response_model=List[PedidoResponse])
def read_pedidos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).offset(skip).limit(limit).all()
    return pedidos

@app.get("/pedidos/{pedido_id}", response_model=PedidoResponse)
def read_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    return pedido

@app.get("/produtos/{produto_id}", response_model=ProdutoResponse)
def read_produto(produto_id: int, db: Session = Depends(get_db)):
    db_produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return db_produto

@app.delete("/pedidos/{pedido_id}", response_model=PedidoResponse)
def delete_pedido(pedido_id: int, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    for item in pedido.itens:
        db.query(Produto).filter(Produto.id == item.produto_id).update({Produto.estoque: Produto.estoque + item.quantidade})
    db.delete(pedido)
    db.commit()
    return pedido

@app.get("/relatorio/", response_model=RelatorioResponse)
def relatorio_vendas(db: Session = Depends(get_db)):
    relatorio = db.query(
        Produto.nome,
        func.sum(ItemPedido.quantidade).label('quantidade_vendida'),
        Produto.estoque.label('estoque_restante'),
        func.sum(ItemPedido.quantidade * Produto.preco).label('valor_vendido')
    ).join(ItemPedido).group_by(Produto.id).all()

    total_vendido = sum(item.valor_vendido for item in relatorio)

    itens = [RelatorioItem(
        nome=item.nome,
        quantidade_vendida=item.quantidade_vendida,
        estoque_restante=item.estoque_restante,
        valor_vendido=item.valor_vendido
    ) for item in relatorio]

    return RelatorioResponse(itens=itens, total_vendido=total_vendido)
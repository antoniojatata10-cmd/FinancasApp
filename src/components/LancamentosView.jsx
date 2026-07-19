import React, { useState } from 'react';
import { Search, Filter, LayoutGrid, List, Plus, Edit2, Trash2, Calendar, FileText, AlertCircle } from 'lucide-react';
console.log("LancamentosView CARREGOU");

export default function LancamentosView({
  launches,
  categories,
  cards,
  role,
  userEmail,
  userId,
  onAddLaunch,
  onEditLaunch,
  onDeleteLaunch,
  getCategoryBalance
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCard, setSelectedCard] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, month, year
  const [viewMode, setViewMode] = useState('table'); // table, cards
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLaunch, setEditingLaunch] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    Data: new Date().toISOString().substring(0, 10),
    card_id: cards?.length > 0 ? cards[0].id : '',
    CategoriaID: '',
    Tipo: 'Entrada',
    Valor: '',
    Descricao: '',
    Conta: 'Banco',
    Referencia: '',
    Status: 'confirmado'
  });
  const [formError, setFormError] = useState('');
  const [savingItemIndex, setSavingItemIndex] = useState(null);

  const handleItemSaved = () => {
    setSavingItemIndex(null);
    setIsFormOpen(false);
  };

  const filteredLaunches = launches.filter(l =>
    role === 'admin' || l.CriadoPor === userId
  );

  // Apply search and UI filters
  const processedLaunches = filteredLaunches.filter(l => {
    const matchesSearch = l.Descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.Referencia && l.Referencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.LancID.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || l.CategoriaID === selectedCategory;

    // Card filter
    const cat = categories.find(c => c.CategoriaID === l.CategoriaID);
    const matchesCard = selectedCard === 'all' || l.card_id === selectedCard || (cat && cat.card_id === selectedCard);

    let matchesPeriod = true;
    if (selectedPeriod !== 'all') {
      const launchDate = new Date(l.Data);
      const today = new Date();
      if (selectedPeriod === 'month') {
        matchesPeriod = launchDate.getMonth() === today.getMonth() && launchDate.getFullYear() === today.getFullYear();
      } else if (selectedPeriod === 'year') {
        matchesPeriod = launchDate.getFullYear() === today.getFullYear();
      }
    }

    return matchesSearch && matchesCategory && matchesCard && matchesPeriod && !l.CategoriaID;
  }).sort((a, b) => new Date(b.Data) - new Date(a.Data));

  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  // Check user permission for Edit/Delete actions
  const canModify = (launch) => {
    console.log("===== CAN MODIFY =====");
    console.log("ROLE RECEBIDO:", role);
    console.log("ROLE lower:", role?.toLowerCase());
    console.log("USER ID:", userId);
    console.log("CRIADO POR:", launch.CriadoPor);

    if (role?.toLowerCase() === "admin") {
      console.log("ADMIN -> TRUE");
      return true;
    }

    if (role?.toLowerCase() === "user" && launch.CriadoPor === userId) {
      console.log("USER -> TRUE");
      return true;
    }

    console.log("FALSE");
    return false;
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    if (role === 'ReadOnly') {
      alert('Seu perfil de Leitura Apenas não possui permissão para adicionar lançamentos.');
      return;
    }
    setEditingLaunch(null);
    setFormData({
      Data: new Date().toISOString().substring(0, 10),
      card_id: cards?.length > 0 ? cards[0].id : '',
      CategoriaID: categories.length > 0 ? categories[0].CategoriaID : '',
      Tipo: 'Entrada',
      Valor: '',
      Descricao: '',
      Conta: 'Banco',
      Referencia: '',
      Status: 'confirmado'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (launch) => {
    console.log("ABRINDO EDIÇÃO:", launch);

    setEditingLaunch(launch);
    setFormData({
      Data: launch.Data,
      card_id: launch.card_id || (cards?.length > 0 ? cards[0].id : ''),
      CategoriaID: launch.CategoriaID,
      Tipo: launch.Tipo,
      Valor: launch.Valor,
      Descricao: launch.Descricao,
      Conta: launch.Conta,
      Referencia: launch.Referencia || '',
      Status: launch.Status || 'confirmado'
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Form Submit Action with validation rules
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const val = Number(formData.Valor);
    if (isNaN(val) || val <= 0) {
      setFormError('O valor deve ser um número positivo maior que zero.');
      return;
    }

    // Validar cartão obrigatório
    if (!formData.card_id) {
      setFormError('Selecione um Cartão. Todo lançamento deve pertencer a um cartão.');
      return;
    }

    const hasCategoria = formData.CategoriaID && formData.CategoriaID !== '';
    const selectedCat = hasCategoria ? categories.find(c => c.CategoriaID === formData.CategoriaID) : null;
    const selectedCard = cards?.find(c => c.id === formData.card_id);

    // Regra: Saída exige categoria
    if (formData.Tipo === 'Saida' && !hasCategoria) {
      setFormError('Lançamento de saída exige uma categoria.');
      return;
    }

    if (formData.Tipo === 'Entrada' && hasCategoria && selectedCat) {
      // --- REGRA: Alocação para categoria (Entrada em categoria) ---
      // Verificar se o cartão tem saldo disponível suficiente
      const cardCats = categories.filter(c => c.card_id === formData.card_id);
      const cardCatIds = cardCats.map(c => c.CategoriaID);
      const cardLaunches = launches.filter(l =>
        (role === 'admin' || l.CriadoPor === userId) &&
        (cardCatIds.includes(l.CategoriaID) || l.card_id === formData.card_id)
      );
      const cardEntradas = cardLaunches.filter(l => l.Tipo === 'Entrada' && !l.CategoriaID).reduce((s, l) => s + Number(l.Valor), 0);
      const cardSaidasComCat = cardLaunches.filter(l => l.Tipo === 'Entrada' && l.CategoriaID && l.CategoriaID !== formData.CategoriaID).reduce((s, l) => s + Number(l.Valor), 0);
      const cardSaidasNormais = cardLaunches.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
      const catSaldos = cardCats.map(c => {
        const ce = cardLaunches.filter(l => l.CategoriaID === c.CategoriaID && l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor), 0);
        const cs = cardLaunches.filter(l => l.CategoriaID === c.CategoriaID && l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
        return ce - cs;
      }).reduce((s, v) => s + v, 0);
      const cardDisponivel = cardEntradas - cardSaidasNormais - catSaldos;

      if (val > cardDisponivel) {
        setFormError(`Saldo insuficiente no cartão "${selectedCard?.name || 'Selecionado'}". Saldo disponível: ${cardDisponivel.toLocaleString('pt-PT')} Kz.`);
        return;
      }

      // --- REGRA: Allocation limit from Mother Category ---
      if (selectedCat.CategoriaMaeID) {
        const parentBalance = getCategoryBalance(selectedCat.CategoriaMaeID, editingLaunch ? editingLaunch.LancID : null);
        if (val > parentBalance) {
          const parentCat = categories.find(c => c.CategoriaID === selectedCat.CategoriaMaeID);
          setFormError(`Saldo insuficiente na categoria mãe "${parentCat ? parentCat.Nome : 'Mãe'}". Saldo disponível: ${parentBalance.toLocaleString('pt-PT')} Kz.`);
          return;
        }
      }
    }

    if (formData.Tipo === 'Saida' && selectedCat) {
      // --- REGRA: Standard expenditure limit ---
      if (selectedCat.Subtipo !== 'Divida') {
        const catBalance = getCategoryBalance(formData.CategoriaID, editingLaunch ? editingLaunch.LancID : null);
        if (val > catBalance) {
          setFormError(`Não é possível registrar saída maior que o saldo disponível na categoria. Saldo atual: ${catBalance.toLocaleString('pt-PT')} Kz.`);
          return;
        }
      }
    }

    const launchPayload = {
      ...formData,
      Valor: val,
      card_id: formData.card_id,
      CategoriaID: hasCategoria ? formData.CategoriaID : null,
      LancID: editingLaunch ? editingLaunch.LancID : 'L_' + Math.random().toString(36).substring(2, 9),
      CriadoPor: editingLaunch ? editingLaunch.CriadoPor : userId,
      EditadoEm: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    if (editingLaunch) {
      onEditLaunch(launchPayload);
    } else {
      onAddLaunch(launchPayload);
    }

    // Se estamos a guardar um item de factura, voltar aos resultados
    if (savingItemIndex !== null) {
      handleItemSaved();
    } else {
      setIsFormOpen(false);
    }
  };

  const getCardBalance = (cardId) => {
    const cardCats = categories.filter(c => c.card_id === cardId);
    const cardCatIds = cardCats.map(c => c.CategoriaID);
    const cardLaunches = launches.filter(l =>
      (role === 'admin' || l.CriadoPor === userId) &&
      (cardCatIds.includes(l.CategoriaID) || l.card_id === cardId)
    );
    const entradas = cardLaunches.filter(l => l.Tipo === 'Entrada' && !l.CategoriaID).reduce((s, l) => s + Number(l.Valor), 0);
    const saidas = cardLaunches.filter(l => l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
    const catSaldos = cardCats.map(c => {
      const ce = cardLaunches.filter(l => l.CategoriaID === c.CategoriaID && l.Tipo === 'Entrada').reduce((s, l) => s + Number(l.Valor), 0);
      const cs = cardLaunches.filter(l => l.CategoriaID === c.CategoriaID && l.Tipo === 'Saida').reduce((s, l) => s + Number(l.Valor), 0);
      return ce - cs;
    }).reduce((s, v) => s + v, 0);
    const disponivel = entradas - saidas - catSaldos;
    const contabilistico = disponivel + catSaldos;
    return { disponivel, contabilistico };
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.CategoriaID === catId);
    if (!cat) return catId;
    if (cat.CategoriaMaeID) {
      const parent = categories.find(c => c.CategoriaID === cat.CategoriaMaeID);
      return `${cat.Nome} (filha de ${parent ? parent.Nome : 'Mãe'})`;
    }
    if (cat.Subtipo !== 'Nenhum') {
      return `${cat.Nome} [${cat.Subtipo}]`;
    }
    return cat.Nome;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Gerenciamento de Carregamento</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Histórico de entradas de saldo nos cartões
          </p>
        </div>
        {role !== 'ReadOnly' && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '10px 18px' }}>
              <Plus size={18} /> Novo Carregamento
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left Side: Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flexGrow: 1 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '220px', flexGrow: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar descrição ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '38px', paddingRight: '12px', fontSize: '0.875rem' }}
            />
          </div>

          {/* Card Dropdown */}
          {cards && cards.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="form-select"
                style={{ padding: '8px 30px 8px 12px', fontSize: '0.85rem', color: '#000', backgroundColor: '#fff' }}
              >
                <option value="all">Todos Cartões</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>{card.icon || '💳'} {card.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Period Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="form-select"
              style={{ padding: '8px 30px 8px 12px', fontSize: '0.85rem', color: '#000', backgroundColor: '#fff' }}
            >
              <option value="all">Todo Histórico</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </div>

        {/* Right Side: View Mode Toggles */}
        <div style={{ display: 'flex', gap: '4px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: viewMode === 'table' ? 'var(--color-accent)' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: viewMode === 'cards' ? 'var(--color-accent)' : 'transparent',
              color: viewMode === 'cards' ? '#fff' : 'var(--text-secondary)',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Main Launches Container */}
      {processedLaunches.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Nenhum lançamento encontrado</p>
          <p style={{ fontSize: '0.85rem' }}>Experimente mudar os filtros ou adicionar um novo registro.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Data</th>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Cartão</th>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Tipo</th>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Valor</th>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Descrição</th>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Criado Por</th>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {processedLaunches.map((launch) => {
                const isIncome = launch.Tipo === 'Entrada';
                const editable = canModify(launch);

                console.log("================================");
                console.log("ROLE:", role);
                console.log("USER ID:", userId);
                console.log("USER EMAIL:", userEmail);
                console.log("CRIADO POR:", launch.CriadoPor);
                console.log("EDITABLE:", editable);
                console.log("================================");

                return (
                  <tr key={launch.LancID} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{launch.Data}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{launch.LancID}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>{(() => { const card = cards.find(c => c.id === launch.card_id); return card ? `${card.icon || '💳'} ${card.name}` : 'Cartão removido'; })()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: isIncome ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                        color: isIncome ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {launch.Tipo}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: isIncome ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {isIncome ? '+' : '-'}{Number(launch.Valor).toLocaleString('pt-PT')} Kz
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {launch.Descricao}
                      {launch.Referencia && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Ref: {launch.Referencia}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {launch.CriadoPor}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(launch)}
                          disabled={!editable}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            background: 'transparent',
                            cursor: editable ? 'pointer' : 'not-allowed',
                            color: editable ? 'var(--text-secondary)' : 'var(--text-muted)',
                            opacity: editable ? 1 : 0.4
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
                              onDeleteLaunch(launch.LancID);
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#dc2626',
                            color: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {processedLaunches.map((launch) => {
            const isIncome = launch.Tipo === 'Entrada';
            const editable = canModify(launch);
            console.log("PERMISSÃO LANÇAMENTO:", {
              role,
              userEmail,
              CriadoPor: launch.CriadoPor,
              editable
            });

            return (
              <div key={launch.LancID} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{launch.Data}</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{(() => { const card = cards.find(c => c.id === launch.card_id); return card ? `${card.icon || '💳'} ${card.name}` : 'Cartão removido'; })()}</h4>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: isIncome ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                    color: isIncome ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {launch.Tipo}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: isIncome ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {isIncome ? '+' : '-'}{Number(launch.Valor).toLocaleString('pt-PT')} Kz
                </h3>

                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{launch.Descricao}</p>
                  {launch.Referencia && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      Ref: {launch.Referencia} | Conta: {launch.Conta}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Por: {launch.CriadoPor.split('@')[0]}</span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(launch)}
                      disabled={!editable}
                      style={{
                        padding: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: editable ? 'pointer' : 'not-allowed',
                        color: editable ? 'var(--text-secondary)' : 'var(--text-muted)',
                        opacity: editable ? 1 : 0.4
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
                          onDeleteLaunch(launch.LancID);
                        }
                      }}
                      disabled={!editable}
                      style={{
                        padding: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: editable ? 'pointer' : 'not-allowed',
                        color: editable ? 'var(--color-error)' : 'var(--text-muted)',
                        opacity: editable ? 1 : 0.4
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL (Add / Edit) */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }} className="animate-fade-in">

          <div className="glass-panel animate-scale-in" style={{
            background: 'var(--bg-secondary)',
            width: '100%',
            maxWidth: '480px',
            maxHeight: 'min(85vh, 580px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>

            {/* Fixed Header */}
            <h3 style={{
              fontSize: '1.25rem', fontWeight: 700,
              borderBottom: '1px solid var(--border-color)',
              padding: '20px 24px 12px', margin: 0, flexShrink: 0
            }}>
              {editingLaunch ? 'Editar Carregamento' : 'Novo Carregamento'}
            </h3>

            {formError && (
              <div style={{
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error)',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                margin: '12px 24px 0', flexShrink: 0
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{
              display: 'flex', flexDirection: 'column',
              flex: 1, overflow: 'hidden', padding: '0 24px'
            }}>
              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Cartão (obrigatório) */}
                <div className="form-group">
                  <label className="form-label">Cartão *</label>
                  <select
                    name="card_id"
                    value={formData.card_id}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, card_id: e.target.value, CategoriaID: '' }));
                      setFormError('');
                    }}
                    required
                    className="form-select"
                  >
                    <option value="">— Selecione um cartão —</option>
                    {cards?.map(card => {
                      const cardBal = getCardBalance(card.id);
                      return (
                        <option key={card.id} value={card.id}>
                          {card.icon || '💳'} {card.name} — Disp: {cardBal.disponivel.toLocaleString('pt-PT')} Kz | Saldo: {cardBal.contabilistico.toLocaleString('pt-PT')} Kz
                        </option>
                      );
                    })}
                  </select>
                  {(!cards || cards.length === 0) && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '4px' }}>
                      Nenhum cartão disponível. Crie um na aba Cartões.
                    </p>
                  )}
                </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Data */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    name="Data"
                    value={formData.Data}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                {/* Tipo */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tipo</label>
                  <select
                    name="Tipo"
                    value={formData.Tipo}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Entrada">Entrada (Carregamento/Alocação)</option>
                    <option value="Saida">Saída (Gasto/Amortização)</option>
                  </select>
                </div>
              </div>

              {/* Valor */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Valor (Kz)</label>
                <input
                  type="number"
                  name="Valor"
                  placeholder="Ex: 15000"
                  value={formData.Valor}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              {/* Helper explanation */}
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(255,255,255,0.01)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px dashed var(--border-color)'
              }}>
                ℹ️ <strong>Alocações:</strong> Inserir uma <strong>Entrada</strong> em um cartão, automaticamente aumentas o saldo disponível no cartão a ser usado pelas categorias do cartão correspondente.
              </div>

              {/* Descrição */}
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  name="Descricao"
                  placeholder="Ex: Aluguel de escritório ou compra de materiais"
                  value={formData.Descricao}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>


              </div>

              {/* Fixed Footer */}
              <div style={{
                display: 'flex', gap: '10px', justifyContent: 'flex-end',
                padding: '16px 0', borderTop: '1px solid var(--border-color)', flexShrink: 0
              }}>
                <button type="button" onClick={() => {
                  if (savingItemIndex !== null) {
                    setSavingItemIndex(null);
                    setIsFormOpen(false);
                  } else {
                    setIsFormOpen(false);
                  }
                }} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {savingItemIndex !== null ? 'Guardar Item' : editingLaunch ? 'Salvar Alterações' : 'Adicionar Carregamento'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

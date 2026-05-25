import React from "react";
import PageHeader from "../../components/PageHeader";
import PerfilUsuario from "../../components/PerfilUsuario";
import { useAuth } from "../../context/AuthContext";

// ============================================================
// 📄 ADMIN / PERFIL
// ============================================================

export default function PerfilPage() {
  const { usuario, actualizarUsuario } = useAuth();

  return (
    <div>
      <PageHeader
        titulo="Mi Perfil"
        subtitulo="Gestiona tus datos personales y de seguridad"
      />
      <PerfilUsuario usuario={usuario} setUsuario={actualizarUsuario} />
    </div>
  );
}

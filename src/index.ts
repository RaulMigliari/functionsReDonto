import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const app = admin.initializeApp();
const db = app.firestore();
const Profissionais = db.collection("Usuarios");

export const enviarNotificacao = functions
  .firestore.document("Chamados/{docId}")
  .onCreate(async () => {
    try {
      const querySnapshot = await Profissionais.get();
      const documents = querySnapshot.docs;

      const tokens = documents.map((doc) => doc.data().fcmToken);
      const titulo = "Emergência";
      const mensagem = "Um novo chamado te espera doutor!";

      const mensagemNotificacao: admin.messaging.NotificationMessagePayload = {
        title: titulo,
        body: mensagem,
      };

      const mensagemEnviar: admin.messaging.MulticastMessage = {
        tokens: tokens,
        notification: mensagemNotificacao,
      };

      const resposta = await admin.messaging().sendMulticast(mensagemEnviar);
      console.log("Notificações enviadas:", resposta.successCount);
    } catch (error) {
      console.error("Erro ao enviar as notificações:", error);
    }
  });

export const enviarNotificacaoAceiteDentista = functions.firestore
  .document("Usuarios/{docId}")
  .onUpdate(async (change) => {
    const antes = change.before.data();
    const depois = change.after.data();

    // Obtenha os campos específicos do documento antes e depois da atualização
    const campoAntes = antes.paciente;
    const campoDepois = depois.paciente;

    // Obtenha o fcmToken do usuário associado à atualização do documento
    const fcmToken = campoDepois.fcmToken;

    if (campoAntes !== campoDepois) {
      const mensagem: admin.messaging.MessagingPayload = {
        notification: {
          title: "Alerta!",
          body: "Um paciente te aceitou.Corra para ver o chamado!",
        },
      };

      await admin.messaging().sendToDevice(fcmToken, mensagem);
      console.log("O campo foi alterado. Enviar notificação.");
    } else {
      console.log("O campo não foi alterado. Não enviar notificação.");
    }

    return null;
  });

export const enviarNotificacaoAceitePaciente = functions.firestore
  .document("Chamados/{docId}")
  .onUpdate(async (change) => {
    const antes = change.before.data();
    const depois = change.after.data();

    // Obtenha os campos específicos do documento antes e depois da atualização
    const campoAntes = antes.status;
    const campoDepois = depois.status;

    // Obtenha o fcmToken do usuário associado à atualização do documento
    const fcmToken = campoDepois.fcmToken;

    if (campoAntes !== campoDepois) {
      const mensagem: admin.messaging.MessagingPayload = {
        notification: {
          title: "Atenção!",
          body: "Um dentista aceitou o seu chamado!",
        },
      };

      await admin.messaging().sendToDevice(fcmToken, mensagem);
      console.log("O campo foi alterado. Enviar notificação.");
    } else {
      console.log("O campo não foi alterado. Não enviar notificação.");
    }

    return null;
  });


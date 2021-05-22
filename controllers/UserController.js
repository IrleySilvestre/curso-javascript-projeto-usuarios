class UserController {
    constructor(formId, tableId) {
        this.formEL = document.getElementById(formId)
        this.tableEl = document.getElementById(tableId)
        this.onSubmit()
    }

    onSubmit() {
        this.formEL.addEventListener("submit", (ev) => {
            ev.preventDefault();
            let btn = document.querySelector('[type=submit]')
            btn.disabled = true
            let values = this.getValues()
            if (!values) return false
            this.getPhoto().then((content) => {
                values.photo = content
                this.addLine(values)
                this.formEL.reset()
                this.removeValidation()
                this.updateCountUsers()
                btn.disabled = false


            }, (e) => {
                console.error(e)
            })
            const el = document.querySelector('#btn-cancel')
            if (el) {
                el.remove()
            }

        });

    }

    getPhoto() {
        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();
            let elements = [...this.formEL.elements].filter(tr => {
                if (tr.name === 'photo') {
                    return tr;
                }
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (e) => {
                reject(e)
            }

            file ? fileReader.readAsDataURL(file) : resolve('dist/img/boxed-bg.png')
        })

    }

    removeValidation() {
        [...this.formEL.elements].forEach((field, index) => {

            if (['name', 'email', 'password'].indexOf(field.name) > -1) {
                field.parentElement.classList.remove('has-error');

            }
        })
    }

    getValues() {
        let user = {};
        let isValid = true;

        [...this.formEL.elements].forEach((field, index) => {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false
            }

            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value
                }
            } else if (field.name == 'admin') {
                user[field.name] = field.checked
            } else {
                user[field.name] = field.value
            }
        });

        if (!isValid) {
            let btn = document.querySelector('[type=submit]')
            btn.disabled = false
            return false

        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        )

    }

    addLine(dataUser) {
        if (document.querySelector('[data-title-form ]').textContent == 'Editar Usuário') {
            let trEl = this.tableEl.querySelectorAll('[data-user]')
            trEl.forEach(trItem => {
                if (trItem.style.display == 'none') {
                    trItem.style.display = ''
                    let tr = this.tableEl.rows[trItem.sectionRowIndex]
                    tr.innerHTML = `
                    <td ><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td >${dataUser.name}</td>
                    <td >${dataUser.email}</td>
                    <td data-admin>${dataUser.admin ? 'Sim' : 'Não'}</td>
                    <td >${Utils.dateFormat(dataUser.register)}</td>
                    <td >${dataUser.country}</td>
                    <td>
                      <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                      <button type="button"  class="btn btn-danger btn-del btn-xs btn-flat">Excluir</button>
                    </td>`
                    tr.querySelector(".btn-edit").addEventListener('click', e => {
                        this.editeUser(tr, dataUser)
                    })
                }


                document.querySelector('[data-title-form]').textContent = 'Novo Usuário'
            })

        } else {
            let tr = document.createElement('tr')
            tr.innerHTML = `
                <td ><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td >${dataUser.name}</td>
                <td >${dataUser.email}</td>
                <td data-admin>${dataUser.admin ? 'Sim' : 'Não'}</td>
                <td >${Utils.dateFormat(dataUser.register)}</td>
                <td >${dataUser.country}</td>
                <td>
                  <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                  <button type="button"  class="btn btn-danger btn-del btn-xs btn-flat">Excluir</button>
                </td>`

            document.querySelector('[data-title-form]').textContent = 'Novo Usuário'

            tr.querySelector(".btn-edit").addEventListener('click', e => {
                this.editeUser(tr, dataUser)
            })

            this.tableEl.appendChild(tr)
        }


    }


    editeUser(tr, dataUser) {
        tr.style.display = 'none'
        document.querySelector('[data-title-form ]').textContent = 'Editar Usuário'

        let btnCancel = document.createElement('button')
        btnCancel.classList.add('btn')
        btnCancel.classList.add('btn-default')
        btnCancel.id = 'btn-cancel'
        btnCancel.type = 'button'
        btnCancel.innerHTML = 'Cancelar'
        document.querySelector('.box-footer').appendChild(btnCancel)

        btnCancel.addEventListener('click', ev => {
            this.formEL.reset()
            this.removeValidation()
            const el = document.querySelector('#btn-cancel')
            document.querySelector('[data-title-form ]').textContent = 'Novo Usuário'
            el.remove()
            tr.style.display = ''
        })

        tr.dataset.user = JSON.stringify(dataUser)
        let json = (JSON.parse(tr.dataset.user))
        let form = document.querySelector('#form-user-create')

        for (let name in json) {
            let field = form.querySelector("[name=" + name.replace("_", "") + "]")
            if (field) {
                switch (field.type) {
                    case 'file':
                        continue
                        break
                    case 'radio':
                        field = form.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                        field.checked = true;
                        break

                    case 'checkbox':
                        field.checked = json[name]
                        break

                    default:
                        field.value = json[name]
                }
            }
        }

    }

    updateCountUsers() {
        let numbersUsers = 0
        let numberUsersAdm = 0
        let userAdmEl = document.querySelectorAll('[data-admin]')
        userAdmEl.forEach(field => {
            if (field.textContent == 'Sim') {
                numberUsersAdm++
            } else {
                numbersUsers++
            }
            document.querySelector('#number-users').innerHTML = numbersUsers
            document.querySelector('#number-users-adm').innerHTML = numberUsersAdm
        })

    }
}